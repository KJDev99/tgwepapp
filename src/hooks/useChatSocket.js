import { useCallback, useEffect, useRef, useState } from 'react'
import { wsChat } from '../api/endpoints'
import { getAccessToken } from '../api/client'
import { telegramAuth } from '../api/auth'
import { setAccessToken } from '../api/client'
import { getInitData } from '../utils/telegramInitData'
import { sendMessageRest } from '../api/chat'
import { filesToBase64Payload } from '../utils/files'

const MAX_BACKOFF = 30000
const PING_INTERVAL = 30000
const AUTH_CLOSE_CODES = new Set([4001, 4003, 1008])

async function silentReauth() {
  try {
    const initData = getInitData()
    if (!initData) return null
    const res = await telegramAuth(initData)
    if (res?.access_token) {
      setAccessToken(res.access_token)
      return res.access_token
    }
  } catch {
    // ignore
  }
  return null
}

export function useChatSocket(roomId, { onMessage } = {}) {
  const [status, setStatus] = useState('idle')
  const [attempts, setAttempts] = useState(0)
  const wsRef = useRef(null)
  const pingTimerRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const closedManuallyRef = useRef(false)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const clearTimers = () => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current)
      pingTimerRef.current = null
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }

  const connect = useCallback(() => {
    if (!roomId) return
    const token = getAccessToken()
    if (!token) {
      setStatus('error')
      return
    }
    closedManuallyRef.current = false
    setStatus('connecting')
    let ws
    try {
      ws = new WebSocket(wsChat(roomId, token))
    } catch {
      setStatus('error')
      return
    }
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('open')
      setAttempts(0)
      pingTimerRef.current = setInterval(() => {
        try {
          ws.send(JSON.stringify({ type: 'ping' }))
        } catch {
          // ignore
        }
      }, PING_INTERVAL)
    }

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data?.type === 'pong') return
        if (data?.event === 'new_message' && data?.message) {
          onMessageRef.current?.(data.message, data)
          return
        }
        onMessageRef.current?.(null, data)
      } catch {
        // ignore non-JSON
      }
    }

    ws.onerror = () => {
      setStatus('error')
    }

    ws.onclose = async (e) => {
      clearTimers()
      if (closedManuallyRef.current) {
        setStatus('closed')
        return
      }

      if (AUTH_CLOSE_CODES.has(e.code)) {
        const newToken = await silentReauth()
        if (!newToken) {
          setStatus('error')
          return
        }
      }

      setAttempts((prev) => {
        const next = prev + 1
        if (next >= 5) {
          setStatus('failed')
          return next
        }
        const delay = Math.min(1000 * Math.pow(2, prev), MAX_BACKOFF)
        reconnectTimerRef.current = setTimeout(connect, delay)
        return next
      })
      setStatus('reconnecting')
    }
  }, [roomId])

  useEffect(() => {
    connect()
    return () => {
      closedManuallyRef.current = true
      clearTimers()
      try {
        wsRef.current?.close()
      } catch {
        // ignore
      }
    }
  }, [connect])

  const manualRetry = useCallback(() => {
    setAttempts(0)
    closedManuallyRef.current = false
    clearTimers()
    try {
      wsRef.current?.close()
    } catch {
      // ignore
    }
    connect()
  }, [connect])

  const send = useCallback(
    async ({ text = '', files = [] }) => {
      const trimmed = text.trim()
      if (!trimmed && files.length === 0) return false

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          const filePayload = await filesToBase64Payload(files)
          wsRef.current.send(
            JSON.stringify({ type: 'send_message', text: trimmed, files: filePayload })
          )
          return true
        } catch {
          // fall through to REST
        }
      }

      try {
        await sendMessageRest(roomId, { text: trimmed, files })
        return true
      } catch {
        return false
      }
    },
    [roomId]
  )

  return { status, attempts, send, retry: manualRetry }
}
