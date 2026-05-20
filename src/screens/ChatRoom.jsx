import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiArrowLeft, FiPaperclip, FiX, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { fetchMessages } from '../api/chat'
import { useChatSocket } from '../hooks/useChatSocket'
import { haptic } from '../hooks/useTelegram'

const STATUS_LABELS = {
  connecting: { text: 'Подключение...', color: 'text-yellow-500' },
  open: { text: 'Онлайн', color: 'text-green-500' },
  reconnecting: { text: 'Переподключение...', color: 'text-yellow-500' },
  closed: { text: 'Не подключено', color: 'text-gray-400' },
  error: { text: 'Ошибка', color: 'text-red-500' },
  failed: { text: 'Не удалось подключиться', color: 'text-red-500' },
  idle: { text: '', color: 'text-gray-400' },
}

export default function ChatRoom({ roomId, onBack }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const endRef = useRef(null)
  const fileInputRef = useRef(null)

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
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  const { status, attempts, send, retry } = useChatSocket(roomId, { onMessage: handleIncoming })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  const handleSend = async () => {
    const trimmed = message.trim()
    if (!trimmed && files.length === 0) return
    setSending(true)
    haptic('light')
    const ok = await send({ text: trimmed, files })
    if (ok) {
      setMessage('')
      setFiles([])
    } else {
      toast.error('Не удалось отправить')
      haptic('error')
    }
    setSending(false)
  }

  const handleFiles = (e) => {
    const arr = Array.from(e.target.files || [])
    if (arr.length === 0) return
    setFiles((prev) => [...prev, ...arr])
    e.target.value = ''
  }

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.idle

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header
        className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-3 py-3 flex items-center gap-3"
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
          <p className={`text-[11px] ${statusInfo.color}`}>{statusInfo.text}</p>
        </div>
      </header>

      {status === 'failed' && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <FiAlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300 flex-1">
            Соединение не удалось ({attempts} попыток)
          </p>
          <button
            onClick={retry}
            className="text-xs font-semibold text-red-700 dark:text-red-300 underline"
          >
            Повторить
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loadingHistory ? (
          <div className="text-center text-xs text-gray-400 py-6">Загрузка...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-6">Сообщений пока нет</div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.is_from_me === true || msg.is_from_me === 'true'
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
                  }`}
                >
                  {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
                  {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs underline opacity-90 truncate"
                        >
                          {att.original_name || 'Файл'}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] opacity-70 mt-0.5">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      {files.length > 0 && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
          {files.map((f, i) => (
            <div
              key={i}
              className="shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2 text-xs"
            >
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button onClick={() => removeFile(i)} aria-label="Удалить">
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 flex gap-2 items-end"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 dark:text-gray-400"
          aria-label="Файл"
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
          className="flex-1 px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 text-sm resize-none max-h-32"
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          disabled={sending || (!message.trim() && files.length === 0)}
          className="bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white p-3 rounded-full shrink-0"
          aria-label="Отправить"
        >
          <FiSend size={18} />
        </motion.button>
      </div>
    </div>
  )
}
