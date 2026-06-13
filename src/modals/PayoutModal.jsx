import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiCreditCard, FiCheck, FiArrowUpCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { fetchCards, createPayout } from '../api/payment'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'
import { cardLast4, cardBrand } from '../utils/card'

// Вывод средств на сохранённую карту
export default function PayoutModal({ onClose, onDone }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchCards()
      .then((list) => {
        if (!mounted) return
        setCards(list)
        if (list.length > 0) setSelected(list[0].id)
      })
      .catch(() => {
        if (mounted) setCards([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleSubmit = async () => {
    if (submitting) return
    const value = Number(amount)
    if (!selected) {
      toast.error('Выберите карту для вывода')
      haptic('error')
      return
    }
    if (!value || value <= 0) {
      toast.error('Введите сумму')
      haptic('error')
      return
    }
    setSubmitting(true)
    try {
      await createPayout({ cardId: selected, amount: value })
      haptic('success')
      toast.success('Заявка на вывод создана')
      onDone?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось вывести средства'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end"
      onClick={submitting ? undefined : onClose}
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
          <h1 className="text-lg font-bold">Вывод средств</h1>
          <button
            onClick={onClose}
            className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            aria-label="Закрыть"
          >
            <FiX size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-6">
            <FiCreditCard size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Нет привязанных карт
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Добавьте карту в профиле, чтобы выводить средства
            </p>
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium mb-2">Сумма вывода</label>
            <div className="relative mb-4">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-lg font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                ₽
              </span>
            </div>

            <label className="block text-sm font-medium mb-2">Карта для вывода</label>
            <div className="max-h-[35vh] overflow-y-auto space-y-2 mb-5">
              {cards.map((card) => {
                const active = selected === card.id
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      haptic('selection')
                      setSelected(card.id)
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 border-2 transition-colors text-left ${
                      active
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent bg-gray-50 dark:bg-gray-700/40'
                    }`}
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
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        active
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {active && <FiCheck size={12} />}
                    </span>
                  </button>
                )
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-green-500 active:bg-green-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiArrowUpCircle size={18} />
                  Вывести
                </>
              )}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
