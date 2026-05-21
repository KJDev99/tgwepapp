import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiX,
  FiPaperclip,
  FiCheck,
  FiPlus,
  FiMessageCircle,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { updateOrderProgress, completeOrder } from '../api/orders'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'
import { ORDER_STATUS, getStatusInfo } from '../constants/orderStatus'

const STATUS_BY_LABEL = (() => {
  const map = {}
  Object.entries(ORDER_STATUS).forEach(([num, info]) => {
    map[info.label.toLowerCase()] = Number(num)
  })
  // tolerate backend grammar variants
  map['в работы'] = 3
  map['завершен'] = 5
  map['отменен'] = 6
  return map
})()

function statusToNumber(status) {
  if (typeof status === 'number') return status
  if (typeof status === 'string') {
    const n = Number(status)
    if (!Number.isNaN(n) && ORDER_STATUS[n]) return n
    return STATUS_BY_LABEL[status.toLowerCase()] || 0
  }
  return 0
}

const PROGRESS_STEP = 10

export default function ExecutorOrderDetailModal({
  order: initialOrder,
  onClose,
  onChanged,
  onOpenChat,
}) {
  const [order, setOrder] = useState(initialOrder)
  const [busy, setBusy] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)

  const currentStatusNum = statusToNumber(order?.status)
  const currentProgress = Number(order?.progress) || 0
  const info = getStatusInfo(currentStatusNum, order?.status_label || order?.status)

  const allowedStatuses = useMemo(() => {
    const list = []
    Object.entries(ORDER_STATUS).forEach(([num, st]) => {
      const n = Number(num)
      if (n > currentStatusNum && n !== 6) list.push({ id: n, label: st.label, tone: st.tone })
    })
    return list
  }, [currentStatusNum])

  const isFinished = currentStatusNum === 5 || currentStatusNum === 6

  const applyResult = (data) => {
    if (data && typeof data === 'object') {
      setOrder((prev) => ({ ...prev, ...data }))
    }
    onChanged?.()
  }

  const handleStatusChange = async (newStatus) => {
    if (busy || isFinished) return
    setBusy(true)
    try {
      const payload = { status: newStatus }
      if (newStatus === 5) payload.progress = 100
      const data = await updateOrderProgress(order.id, payload)
      haptic('success')
      toast.success('Статус обновлён')
      applyResult(data)
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось обновить'))
    } finally {
      setBusy(false)
    }
  }

  const handleProgress = async () => {
    if (busy || isFinished) return
    const next = Math.min(100, currentProgress + PROGRESS_STEP)
    if (next === currentProgress) return
    setBusy(true)
    try {
      const data = await updateOrderProgress(order.id, { progress: next })
      haptic('light')
      applyResult(data)
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось обновить'))
    } finally {
      setBusy(false)
    }
  }

  const handleComplete = async () => {
    if (busy || isFinished) return
    setBusy(true)
    try {
      const data = await completeOrder(order.id, { status: 5, progress: 100 })
      haptic('success')
      toast.success('Работа сдана')
      applyResult(data)
      setConfirmComplete(false)
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось завершить'))
    } finally {
      setBusy(false)
    }
  }

  if (!order) {
    return null
  }

  const typeName =
    typeof order.type_order === 'object' && order.type_order
      ? order.type_order.name
      : order.type_order

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
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
          <h1 className="text-lg font-bold">Заказ</h1>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            aria-label="Закрыть"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto pb-2 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold flex-1 break-words">{order.title}</h2>
            <span className={`text-[10px] px-2 py-1 rounded shrink-0 ${info.tone}`}>
              {info.label}
            </span>
          </div>

          <Row label="Тип" value={typeName || '—'} />
          <Row
            label="Срок"
            value={order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : '—'}
          />
          <Row label="Цена" value={order.price ? `${order.price} ₽` : '—'} />
          <Row label="Описание" value={order.description || '—'} multiline />

          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
              Прогресс
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentProgress}%` }}
                  transition={{ duration: 0.4 }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-right text-gray-600 dark:text-gray-400">
                {currentProgress}%
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
              Предметы ({order.items?.length || 0})
            </p>
            {order.items && order.items.length > 0 ? (
              <ul className="space-y-1">
                {order.items.map((it, idx) => {
                  const isObj = typeof it === 'object' && it !== null
                  const label = isObj ? it.title : String(it)
                  const key = isObj ? it.id ?? idx : idx
                  return (
                    <li
                      key={key}
                      className="text-sm bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2"
                    >
                      {label}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm">—</p>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
              Файлы ({order.files?.length || 0})
            </p>
            {order.files && order.files.length > 0 ? (
              <ul className="space-y-1">
                {order.files.map((f) => {
                  const name = decodeURIComponent(
                    (f.order_file || '').split('/').pop() || 'файл'
                  )
                  return (
                    <li
                      key={f.id}
                      className="text-xs bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 flex items-center gap-2"
                    >
                      <FiPaperclip size={14} className="shrink-0 text-gray-400" />
                      <a
                        href={f.order_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 truncate flex-1"
                      >
                        {name}
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm">—</p>
            )}
          </div>

          {!isFinished && (
            <>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                  Изменить статус
                </p>
                {allowedStatuses.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                    Нет доступных статусов
                  </p>
                ) : (
                  <div className="space-y-2">
                    {allowedStatuses.map((s) => (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(s.id)}
                        disabled={busy}
                        className={`w-full text-left p-3 rounded-lg flex items-center justify-between text-sm font-semibold disabled:opacity-50 ${s.tone}`}
                      >
                        <span>→ {s.label}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleProgress}
                  disabled={busy || currentProgress >= 100}
                  className="flex-1 bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
                >
                  <FiPlus size={16} />+{PROGRESS_STEP}% прогресс
                </motion.button>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {onOpenChat && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenChat(order)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <FiMessageCircle size={15} /> Чат
            </motion.button>
          )}
          {!isFinished && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                haptic('warning')
                setConfirmComplete(true)
              }}
              disabled={busy}
              className="flex-1 bg-green-500 active:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <FiCheck size={15} /> Завершить
            </motion.button>
          )}
        </div>

        {confirmComplete && (
          <div
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setConfirmComplete(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 w-full max-w-xs"
            >
              <h3 className="font-semibold text-base mb-2">Завершить работу?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Заказ будет помечен как сдан.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmComplete(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Отмена
                </button>
                <button
                  onClick={handleComplete}
                  disabled={busy}
                  className="flex-1 bg-green-500 active:bg-green-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold"
                >
                  {busy ? '...' : 'Завершить'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function Row({ label, value, multiline = false }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>
      <p
        className={`text-sm text-gray-900 dark:text-gray-100 ${
          multiline ? 'whitespace-pre-wrap break-words' : 'break-words'
        }`}
      >
        {value || '—'}
      </p>
    </div>
  )
}
