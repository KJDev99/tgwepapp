import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiPaperclip, FiCheck, FiMessageCircle, FiZap, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { updateOrderProgress, addOrderExecutor, sendInviteResponse, fetchMyInviteResponses } from '../api/orders'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'
import { ORDER_STATUS, getStatusInfo } from '../constants/orderStatus'
import { absoluteMediaUrl } from '../api/endpoints'

const STATUS_BY_LABEL = (() => {
  const map = {}
  Object.entries(ORDER_STATUS).forEach(([num, info]) => {
    map[info.label.toLowerCase()] = Number(num)
  })
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

export default function ExecutorOrderDetailModal({
  order: initialOrder,
  user,
  onClose,
  onChanged,
  onOpenChat,
}) {
  const [order, setOrder] = useState(initialOrder)
  const [busy, setBusy] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [proposalText, setProposalText] = useState('')
  const [proposalSent, setProposalSent] = useState(false)
  const [sendingProposal, setSendingProposal] = useState(false)
  const [checkingProposal, setCheckingProposal] = useState(false)

  const currentStatusNum = statusToNumber(order?.status)
  const currentProgress = Number(order?.progress) || 0

  useEffect(() => {
    setInputValue(String(currentProgress))
  }, [currentProgress])

  // Check if proposal already sent for this order
  useEffect(() => {
    if (!order?.id) return
    setCheckingProposal(true)
    fetchMyInviteResponses()
      .then((list) => {
        const already = list.some((item) => item.order === order.id)
        setProposalSent(already)
      })
      .catch(() => {})
      .finally(() => setCheckingProposal(false))
  }, [order?.id])

  if (!order) return null

  const info = getStatusInfo(currentStatusNum, order.status_label || order.status)
  const isFinished = currentStatusNum === 5 || currentStatusNum === 6
  const canEdit = !isFinished && currentProgress < 100
  // исполнитель назначен на заказ (это его работа)
  const isMine = Boolean(order.assignment_id)
  const isAvailable = !isMine && currentStatusNum === 1

  const handleTakeOrder = async () => {
    if (busy || !user) {
      toast.error('Данные пользователя не найдены')
      return
    }
    setBusy(true)
    try {
      await addOrderExecutor(order.id, user.id)
      haptic('success')
      toast.success('Вы успешно приняли заказ!')
      onChanged?.()
      onClose?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось принять заказ'))
    } finally {
      setBusy(false)
    }
  }

  const handleSendProposal = async () => {
    if (sendingProposal) return
    if (!proposalText.trim()) {
      toast.error('Введите описание предложения')
      haptic('error')
      return
    }
    if (proposalSent) {
      toast.error('Вы уже отправили предложение на этот заказ')
      haptic('error')
      return
    }
    setSendingProposal(true)
    try {
      await sendInviteResponse(order.id, proposalText.trim())
      haptic('success')
      toast.success('Предложение отправлено!')
      setProposalSent(true)
      setProposalText('')
      onChanged?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось отправить предложение'))
    } finally {
      setSendingProposal(false)
    }
  }

  const typeName =
    typeof order.type_order === 'object' && order.type_order
      ? order.type_order.name
      : order.type_order

  const applyResult = (data) => {
    if (data && typeof data === 'object') {
      setOrder((prev) => ({ ...prev, ...data }))
    }
    onChanged?.()
  }

  const setProgressTo = async (value) => {
    if (busy || !canEdit) return
    const next = Math.max(0, Math.min(100, Math.round(Number(value))))
    if (Number.isNaN(next)) {
      toast.error('Введите число от 0 до 100')
      haptic('error')
      return
    }
    if (next < currentProgress) {
      toast.error('Прогресс можно только увеличивать')
      haptic('error')
      return
    }
    if (next === currentProgress) return
    setBusy(true)
    try {
      const data = await updateOrderProgress(order.id, { progress: next })
      haptic(next === 100 ? 'success' : 'light')
      applyResult(data)
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось обновить'))
    } finally {
      setBusy(false)
    }
  }

  const handleApply = () => setProgressTo(inputValue)
  const handleSetMax = () => setProgressTo(100)

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
            value={order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
          />
          <Row label="Цена" value={order.price ? `${order.price} ₽` : '—'} />
          <Row label="Описание" value={order.description || '—'} multiline />

          {isMine && (
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
          )}

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
                  const fileUrl = absoluteMediaUrl(f.order_file)
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
                        href={fileUrl}
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

          {isFinished ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              Заказ {info.label.toLowerCase()}
            </p>
          ) : isMine && currentProgress >= 100 ? (
            <p className="text-sm text-center py-2 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg px-3">
              Прогресс 100% — ожидайте проверку студента
            </p>
          ) : !isMine ? (
            <div className="space-y-3 mt-2">
              {/* Proposal section */}
              {checkingProposal ? (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : proposalSent ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium flex items-center justify-center gap-1.5">
                    <FiCheck size={16} />
                    Предложение отправлено
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Ваше предложение
                    </label>
                    <textarea
                      value={proposalText}
                      onChange={(e) => setProposalText(e.target.value)}
                      placeholder="Опишите ваше предложение, опыт, сроки..."
                      maxLength={1000}
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-green-500 min-h-20 resize-none text-sm"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                      {proposalText.length}/1000
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendProposal}
                    disabled={sendingProposal || !proposalText.trim()}
                    className="w-full bg-green-500 active:bg-green-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    {sendingProposal ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <FiSend size={16} />
                        Отправить предложение
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Обновить прогресс
              </p>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApply()
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApply}
                  disabled={busy}
                  className="bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-semibold text-sm flex items-center gap-1.5"
                >
                  <FiCheck size={15} /> Применить
                </motion.button>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSetMax}
                disabled={busy}
                className="w-full bg-purple-500 active:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                <FiZap size={16} /> Сразу 100%
              </motion.button>
            </div>
          )}
        </div>

        {onOpenChat && isMine && (
          <div className="flex gap-2 mt-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenChat(order)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <FiMessageCircle size={15} /> Чат
            </motion.button>
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
