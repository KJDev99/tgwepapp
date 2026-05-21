import { motion } from 'framer-motion'
import { FiLogOut, FiRefreshCw } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'
import Avatar from '../components/Avatar'
import { useExecutorOrders } from '../hooks/useOrders'
import { getStatusInfo } from '../constants/orderStatus'
import { useTelegramPhoto } from '../hooks/useTelegram'

export default function ExecutorHome({ user, onLogout, onOpenOrder, refreshKey }) {
  const { orders, loading, reload } = useExecutorOrders(refreshKey)
  const displayName = user?.full_name || user?.username || 'друг'
  const tgPhotoUrl = useTelegramPhoto()
  const photoUrl = user?.avatar_url || tgPhotoUrl

  return (
    <div className="min-h-screen px-4 pt-4 pb-24 safe-area">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 mb-6"
      >
        <div className="flex items-center min-w-0 gap-3">
          <Avatar name={displayName} photoUrl={photoUrl} size={40} />
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">Привет, {displayName}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ваши заказы</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={reload}
            className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800"
            aria-label="Обновить"
          >
            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onLogout}
            className="p-2 text-red-600 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300"
            aria-label="Выйти"
          >
            <FiLogOut size={18} />
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : orders.length === 0 ? (
        <div className="py-10 text-sm text-center text-gray-400">Нет заказов</div>
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
                className="p-4 bg-white border border-gray-200 shadow-sm cursor-pointer dark:bg-gray-800 rounded-xl dark:border-gray-700"
              >
                <h3 className="mb-2 text-sm font-semibold truncate">
                  {order.title || `Заказ #${order.id}`}
                </h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 truncate dark:text-gray-400">
                    {typeof order.progress === 'number' ? `${order.progress}%` : '—'}
                  </span>
                  <span className={`px-2 py-1 rounded font-semibold shrink-0 ${info.tone}`}>
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
