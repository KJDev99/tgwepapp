import { motion } from 'framer-motion'
import { FiClock, FiRefreshCw } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'
import { useExecutorOrders } from '../hooks/useOrders'
import { getStatusInfo } from '../constants/orderStatus'

export default function ExecutorOrders({ onOpenOrder, refreshKey }) {
  const { orders, loading, reload } = useExecutorOrders(refreshKey)

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <div className="flex justify-between items-center mb-5">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold"
        >
          Мои заказы
        </motion.h1>
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
      ) : orders.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-400">Заказов пока нет</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => {
            const info = getStatusInfo(Number(order.status), order.status_label || order.status)
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onOpenOrder?.(order)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <h3 className="font-semibold mb-2 text-sm truncate">
                  {order.title || `Заказ #${order.id}`}
                </h3>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400 truncate">
                    {order.user || '—'}
                  </span>
                  <span className={`px-2 py-1 rounded font-semibold shrink-0 ${info.tone}`}>
                    {info.label}
                  </span>
                </div>
                {order.deadline && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <FiClock size={12} />
                    {new Date(order.deadline).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
