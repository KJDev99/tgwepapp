import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { SkeletonCard } from '../components/Skeleton'
import { useExecutorOrders } from '../hooks/useOrders'
import { getStatusInfo, ORDER_STATUS } from '../constants/orderStatus'
import { updateOrderProgress, completeOrder } from '../api/orders'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'

export default function ExecutorWork() {
  const { orders, loading, reload } = useExecutorOrders()
  const [busyId, setBusyId] = useState(null)

  const inProgress = orders.filter((o) => {
    const s = Number(o.status)
    if (!Number.isNaN(s)) return s !== 5 && s !== 6
    const sLower = String(o.status || '').toLowerCase()
    return sLower !== 'завершён' && sLower !== 'завершен' && sLower !== 'отменён' && sLower !== 'отменен'
  })

  const handleProgress = async (order, delta) => {
    const next = Math.max(0, Math.min(100, (Number(order.progress) || 0) + delta))
    setBusyId(order.id)
    try {
      await updateOrderProgress(order.id, { progress: next })
      haptic('success')
      await reload()
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Не удалось обновить'))
      haptic('error')
    } finally {
      setBusyId(null)
    }
  }

  const handleComplete = async (order) => {
    setBusyId(order.id)
    try {
      await completeOrder(order.id, { progress: 100 })
      toast.success('Работа сдана')
      haptic('success')
      await reload()
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Не удалось завершить'))
      haptic('error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold">Мои работы</h1>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={reload}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
          aria-label="Обновить"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : inProgress.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-400">Нет активных работ</div>
      ) : (
        <div className="space-y-3">
          {inProgress.map((order, idx) => {
            const progress = Number(order.progress) || 0
            const info = getStatusInfo(Number(order.status), order.status_label)
            const busy = busyId === order.id
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-sm truncate flex-1">
                    {order.title || `Заказ #${order.id}`}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${info.tone}`}>
                    {info.label}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6 }}
                      className="bg-blue-500 h-2 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {progress}%
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleProgress(order, -10)}
                    disabled={busy || progress === 0}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 disabled:opacity-40 text-sm font-semibold py-2 rounded-lg"
                  >
                    −10%
                  </button>
                  <button
                    onClick={() => handleProgress(order, 10)}
                    disabled={busy || progress >= 100}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 disabled:opacity-40 text-sm font-semibold py-2 rounded-lg"
                  >
                    +10%
                  </button>
                  {progress === 100 && (
                    <button
                      onClick={() => handleComplete(order)}
                      disabled={busy}
                      className="flex-1 bg-green-500 active:bg-green-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
                    >
                      <FiCheck size={14} />
                      Сдать
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
