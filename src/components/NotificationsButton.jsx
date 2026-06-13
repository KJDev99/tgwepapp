import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiX, FiTrash2, FiCheckCircle, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../api/notifications'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function NotificationsButton({ refreshKey = 0 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchNotifications()
      setItems(list)
    } catch {
      // тихо: колокольчик не должен ломать экран
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const unread = items.filter((n) => !n.is_read).length

  const openModal = () => {
    haptic('selection')
    setOpen(true)
    load()
  }

  const handleRead = async (n) => {
    if (n.is_read || busyId) return
    setBusyId(n.id)
    try {
      await markNotificationRead(n.id)
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Не удалось обновить'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    if (busyId) return
    setBusyId(id)
    try {
      await deleteNotification(id)
      haptic('success')
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось удалить'))
    } finally {
      setBusyId(null)
    }
  }

  const handleMarkAll = async () => {
    if (markingAll || unread === 0) return
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      haptic('success')
      setItems((prev) => prev.map((x) => ({ ...x, is_read: true })))
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось обновить'))
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={openModal}
        className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0"
        aria-label="Уведомления"
      >
        <FiBell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5 max-w-md mx-auto"
              style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-bold">Уведомления</h1>
                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAll}
                      disabled={markingAll}
                      className="text-xs text-blue-500 active:text-blue-600 font-medium px-2 py-1 disabled:opacity-50 flex items-center gap-1"
                    >
                      <FiCheckCircle size={13} /> Прочитать все
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
                    aria-label="Закрыть"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="max-h-[65vh] overflow-y-auto -mx-1 px-1">
                {loading && items.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-12">
                    <FiBell size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Уведомлений нет</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleRead(n)}
                        className={`rounded-xl p-3 border flex gap-3 cursor-pointer transition-colors ${
                          n.is_read
                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.is_read ? (
                            <span className="block w-2 h-2 rounded-full bg-transparent" />
                          ) : (
                            <span className="block w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold break-words">
                              {n.title || 'Уведомление'}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                              {formatDate(n.created_at)}
                            </span>
                          </div>
                          {n.body && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 whitespace-pre-wrap break-words">
                              {n.body}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(n.id)
                          }}
                          disabled={busyId === n.id}
                          className="p-1.5 rounded-lg text-gray-400 active:bg-gray-100 dark:active:bg-gray-700 shrink-0 self-center"
                          aria-label="Удалить"
                        >
                          {busyId === n.id ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiTrash2 size={15} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
