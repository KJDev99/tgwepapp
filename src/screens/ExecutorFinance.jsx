import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowUpCircle, FiInfo, FiClock } from 'react-icons/fi'
import { fetchPayouts } from '../api/payment'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'

const PayoutModal = lazy(() => import('../modals/PayoutModal'))

function formatAmount(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return num.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export default function ExecutorFinance() {
  const [payouts, setPayouts] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPayout, setShowPayout] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { items, count: total } = await fetchPayouts({ page: 1, limit: 50 })
      setPayouts(items)
      setCount(total)
    } catch (e) {
      setError(extractErrorMessage(e, 'Не удалось загрузить операции'))
      setPayouts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalWithdrawn = payouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const openPayout = () => {
    haptic('light')
    setShowPayout(true)
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold mb-5"
      >
        Финансы
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 mb-4 text-white shadow-md"
      >
        <p className="text-xs opacity-90 mb-1">Всего выведено</p>
        <h2 className="text-3xl font-bold mb-1">{formatAmount(totalWithdrawn)} ₽</h2>
        <p className="text-xs opacity-75">Операций: {count}</p>
      </motion.div>

      <div className="mb-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
        <FiInfo size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Вывод средств выполняется на привязанную карту. Карты можно добавить в профиле.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onClick={openPayout}
        className="w-full bg-green-500 active:bg-green-600 text-white font-semibold py-3.5 rounded-lg mb-5 flex items-center justify-center gap-2"
      >
        <FiArrowUpCircle size={18} />
        Вывести средства
      </motion.button>

      <h3 className="text-base font-semibold mb-3">История выводов</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <button
            onClick={load}
            className="bg-blue-500 active:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Повторить
          </button>
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-10">
          <FiClock size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Операций пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payouts.map((tx, idx) => (
            <motion.div
              key={tx.id ?? idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.4) }}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 flex justify-between items-center shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FiArrowUpCircle size={20} className="text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Вывод средств</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {formatDate(tx.created_at)}
                  </p>
                </div>
              </div>
              <span className="text-red-600 dark:text-red-400 font-bold text-sm whitespace-nowrap">
                −{formatAmount(tx.amount)} ₽
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <Suspense fallback={null}>
        <AnimatePresence>
          {showPayout && (
            <PayoutModal
              onClose={() => setShowPayout(false)}
              onDone={() => {
                setShowPayout(false)
                load()
              }}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  )
}
