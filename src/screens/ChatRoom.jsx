import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiArrowLeft, FiPaperclip, FiAlertCircle, FiImage } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { fetchMessages } from '../api/chat'
import { useChatSocket } from '../hooks/useChatSocket'
import { haptic } from '../hooks/useTelegram'
import { prepareFile, validateFile } from '../utils/files'
import FilePreview from '../components/FilePreview'
import AttachmentView from '../components/AttachmentView'

const MAX_TOTAL_FILES = 10

export default function ChatRoom({ roomId, onBack }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [processingFiles, setProcessingFiles] = useState(false)
  const endRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => {
    setLoadingHistory(true)
    fetchMessages(roomId)
      .then((list) => {
        const sorted = [...list].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        setMessages(sorted)
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false))
  }, [roomId])

  const handleIncoming = useCallback((msg) => {
    if (!msg) return
    setMessages((prev) => {
      const matchIdx = prev.findIndex(
        (m) => m.__optimistic && msg.is_from_me && (m.text || '') === (msg.text || '')
      )
      if (matchIdx >= 0) {
        const local = prev[matchIdx]
        local.attachments?.forEach((a) => {
          if (a?.__local && a.url) URL.revokeObjectURL(a.url)
        })
      }
      const withoutLocal = matchIdx >= 0 ? prev.filter((_, i) => i !== matchIdx) : prev
      if (withoutLocal.some((m) => m.id === msg.id)) return withoutLocal
      return [...withoutLocal, msg]
    })
  }, [])

  useEffect(() => {
    return () => {
      setMessages((prev) => {
        prev.forEach((m) =>
          m.attachments?.forEach((a) => {
            if (a?.__local && a.url) URL.revokeObjectURL(a.url)
          })
        )
        return prev
      })
    }
  }, [])

  const { status, attempts, send, retry } = useChatSocket(roomId, { onMessage: handleIncoming })

  const isFirstScrollRef = useRef(true)
  const scrollToBottom = useCallback((behavior = 'auto') => {
    endRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    if (messages.length === 0) return
    const behavior = isFirstScrollRef.current ? 'auto' : 'smooth'
    isFirstScrollRef.current = false
    const t1 = requestAnimationFrame(() => scrollToBottom(behavior))
    const t2 = setTimeout(() => scrollToBottom('auto'), 250)
    return () => {
      cancelAnimationFrame(t1)
      clearTimeout(t2)
    }
  }, [messages.length, scrollToBottom])

  const handleMediaLoad = useCallback(() => {
    scrollToBottom('auto')
  }, [scrollToBottom])

  const addFiles = useCallback(async (incoming) => {
    if (incoming.length === 0) return
    if (files.length + incoming.length > MAX_TOTAL_FILES) {
      toast.error(`Максимум ${MAX_TOTAL_FILES} файлов`)
      haptic('error')
      return
    }
    setProcessingFiles(true)
    const accepted = []
    for (const raw of incoming) {
      const check = validateFile(raw)
      if (!check.ok) {
        toast.error(check.reason)
        haptic('error')
        continue
      }
      try {
        const prepared = await prepareFile(raw)
        accepted.push(prepared)
      } catch {
        toast.error(`${raw.name}: ошибка обработки`)
      }
    }
    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted])
      haptic('light')
    }
    setProcessingFiles(false)
  }, [files.length])

  const handleFilesPicked = (e) => {
    const arr = Array.from(e.target.files || [])
    e.target.value = ''
    addFiles(arr)
  }

  const removeFile = (i) => {
    haptic('selection')
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSend = async () => {
    const trimmed = message.trim()
    if (!trimmed && files.length === 0) return
    if (sending || processingFiles) return

    setSending(true)
    haptic('light')

    const localAttachments = files.map((f, i) => ({
      id: `local-att-${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      original_name: f.name,
      __local: true,
    }))

    const optimistic = {
      id: `local-${Date.now()}`,
      __optimistic: true,
      is_from_me: true,
      text: trimmed,
      attachments: localAttachments,
      created_at: new Date().toISOString(),
      __pending_files: files.length,
    }
    setMessages((prev) => [...prev, optimistic])

    const sentText = trimmed
    const sentFiles = files
    setMessage('')
    setFiles([])

    const ok = await send({ text: sentText, files: sentFiles })

    if (!ok) {
      localAttachments.forEach((a) => URL.revokeObjectURL(a.url))
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setMessage(sentText)
      setFiles(sentFiles)
      toast.error('Не удалось отправить')
      haptic('error')
    }
    setSending(false)
  }

  const canSend = (message.trim() || files.length > 0) && !sending && !processingFiles

  return (
    <div
      className="flex flex-col bg-light dark:bg-dark"
      style={{ height: '100dvh' }}
    >
      <header
        className="shrink-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-3 py-3 flex items-center gap-3"
        style={{ paddingTop: 'calc(12px + env(safe-area-inset-top))' }}
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg"
          aria-label="Назад"
        >
          <FiArrowLeft size={20} />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-sm truncate">Чат</h1>
        </div>
      </header>

      {status === 'failed' && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <FiAlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300 flex-1">
            Соединение не удалось ({attempts})
          </p>
          <button
            onClick={retry}
            className="text-xs font-semibold text-red-700 dark:text-red-300 underline"
          >
            Повторить
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
        {loadingHistory ? (
          <div className="text-center text-xs text-gray-400 py-6">Загрузка...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-6">Сообщений пока нет</div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.is_from_me === true || msg.is_from_me === 'true'
            const isPending = msg.__optimistic
            return (
              <motion.div
                key={msg.id ?? `local-${idx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl ${
                    isMine
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                  } ${isPending ? 'opacity-70' : ''}`}
                >
                  {msg.text && (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  )}
                  {isPending && msg.__pending_files > 0 && (
                    <p className="text-[11px] opacity-80 italic mt-1">
                      Отправка файлов ({msg.__pending_files})...
                    </p>
                  )}
                  {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {msg.attachments.map((att) => (
                        <AttachmentView
                          key={att.id}
                          attachment={att}
                          isMine={isMine}
                          onLoad={handleMediaLoad}
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] opacity-70 mt-0.5 flex items-center gap-1 justify-end">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                    {isPending && <span>·</span>}
                    {isPending && <span>отправка</span>}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {files.length > 0 && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto border-t border-gray-100 dark:border-gray-800 pt-2 bg-white dark:bg-gray-900">
          {files.map((f, i) => (
            <FilePreview key={`${f.name}-${i}`} file={f} onRemove={() => removeFile(i)} />
          ))}
        </div>
      )}

      {processingFiles && (
        <div className="px-3 py-1 text-[11px] text-gray-500 dark:text-gray-400 text-center">
          Обработка файлов...
        </div>
      )}

      <div
        className="shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-2 flex gap-1 items-end"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFilesPicked}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesPicked}
          className="hidden"
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => imageInputRef.current?.click()}
          className="p-2 text-gray-500 dark:text-gray-400 shrink-0"
          aria-label="Фото"
          disabled={processingFiles}
        >
          <FiImage size={20} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 dark:text-gray-400 shrink-0"
          aria-label="Файл"
          disabled={processingFiles}
        >
          <FiPaperclip size={20} />
        </motion.button>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          rows={1}
          placeholder="Сообщение..."
          className="flex-1 px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 text-sm resize-none max-h-32 min-w-0"
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          disabled={!canSend}
          className="bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white p-3 rounded-full shrink-0"
          aria-label="Отправить"
        >
          <FiSend size={18} />
        </motion.button>
      </div>
    </div>
  )
}
