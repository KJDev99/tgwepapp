import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCreditCard, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
  fetchCards,
  addCard,
  confirmCard,
  deleteCard,
  extractConfirmationToken,
  extractPaymentId,
} from '../api/payment'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'
import { cardLast4, cardBrand } from '../utils/card'
import YooKassaWidget from './YooKassaWidget'

export default function CardsSection() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [widgetToken, setWidgetToken] = useState(null)
  const [pendingPaymentId, setPendingPaymentId] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const list = await fetchCards()
      setCards(list)
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Не удалось загрузить карты'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async () => {
    if (adding) return
    haptic('light')
    setAdding(true)
    try {
      const data = await addCard()
      const token = extractConfirmationToken(data)
      if (!token) throw new Error('Не получен токен подтверждения')
      setPendingPaymentId(extractPaymentId(data))
      setWidgetToken(token)
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось добавить карту'))
    } finally {
      setAdding(false)
    }
  }

  const handleWidgetSuccess = async () => {
    setConfirming(true)
    try {
      if (pendingPaymentId) await confirmCard(pendingPaymentId)
      haptic('success')
      toast.success('Карта добавлена')
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Не удалось подтвердить карту'))
    } finally {
      setConfirming(false)
      setWidgetToken(null)
      setPendingPaymentId(null)
      load()
    }
  }

  const closeWidget = () => {
    setWidgetToken(null)
    setPendingPaymentId(null)
  }

  const handleDelete = async (cardId) => {
    if (deletingId) return
    setDeletingId(cardId)
    try {
      await deleteCard(cardId)
      haptic('success')
      toast.success('Карта удалена')
      setCards((prev) => prev.filter((c) => c.id !== cardId))
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось удалить'))
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-5 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <FiCreditCard size={18} />
          </span>
          <h3 className="text-base font-semibold">Мои карты</h3>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          disabled={adding}
          className="flex items-center gap-1 bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg"
        >
          {adding ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiPlus size={14} />
          )}
          Добавить
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-5">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          У вас пока нет привязанных карт
        </p>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-3"
            >
              <FiCreditCard size={20} className="text-gray-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tabular-nums">
                  •••• {cardLast4(card)}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {cardBrand(card)}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  haptic('warning')
                  setConfirmDeleteId(card.id)
                }}
                disabled={deletingId === card.id}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0"
                aria-label="Удалить карту"
              >
                {deletingId === card.id ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiTrash2 size={16} />
                )}
              </motion.button>
            </div>
          ))}
        </div>
      )}

      {/* Виджет привязки карты */}
      <AnimatePresence>
        {widgetToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-end"
            onClick={confirming ? undefined : closeWidget}
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
                <h2 className="text-lg font-bold">Привязка карты</h2>
                <button
                  onClick={closeWidget}
                  disabled={confirming}
                  className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg disabled:opacity-50"
                  aria-label="Закрыть"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                <YooKassaWidget
                  confirmationToken={widgetToken}
                  onSuccess={handleWidgetSuccess}
                />
              </div>
              {confirming && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                  Подтверждаем карту…
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Подтверждение удаления */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <div
            className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 w-full max-w-xs"
            >
              <h3 className="font-semibold text-base mb-2">Удалить карту?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Карту можно будет привязать заново в любой момент.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={deletingId !== null}
                  className="flex-1 bg-red-500 active:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold"
                >
                  {deletingId !== null ? '...' : 'Удалить'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
