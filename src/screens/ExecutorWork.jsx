import { motion } from 'framer-motion'
import { FiRefreshCw } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'
import { useExecutorOrders } from '../hooks/useOrders'
import { getStatusInfo } from '../constants/orderStatus'
import { haptic } from '../hooks/useTelegram'

export default function ExecutorWork({ onOpenOrder, refreshKey }) {
  const { orders, loading, reload } = useExecutorOrders(refreshKey)

  const inProgress = orders.filter((o) => {
    const s = Number(o.status)
    if (!Number.isNaN(s)) return s !== 5 && s !== 6
    const sLower = String(o.status || '').toLowerCase()
    return (
      sLower !== 'завершён' &&
      sLower !== 'завершен' &&
      sLower !== 'отменён' &&
      sLower !== 'отменен'
    )
  })

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
            const info = getStatusInfo(Number(order.status), order.status_label || order.status)
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  haptic('selection')
                  onOpenOrder?.(order)
                }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-sm truncate flex-1">
                    {order.title || `Заказ #${order.id}`}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded shrink-0 ${info.tone}`}>
                    {info.label}
                  </span>
                </div>
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
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
