import { motion } from 'framer-motion'
import { FiRefreshCw } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'
import { useStudentOrders } from '../hooks/useOrders'
import { getStatusInfo } from '../constants/orderStatus'

export default function StudentOrders({ onOpenOrder, refreshKey }) {
  const { orders, loading, reload } = useStudentOrders(refreshKey)

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-5"
      >
        <h1 className="text-xl font-bold">Мои заказы</h1>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={reload}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
          aria-label="Обновить"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </motion.div>

      {loading ? (
        <>
          <SkeletonCard />
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
                onClick={() => onOpenOrder?.(order.id)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <h3 className="font-semibold mb-2 text-sm truncate">{order.title}</h3>
                <div className="flex justify-between items-end gap-2">
                  <div className="min-w-0">
                    {order.type_order?.name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {order.type_order.name}
                      </p>
                    )}
                    {order.deadline && (
                      <p className="text-xs text-gray-400">
                        До {new Date(order.deadline).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded shrink-0 ${info.tone}`}>
                    {info.label}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
