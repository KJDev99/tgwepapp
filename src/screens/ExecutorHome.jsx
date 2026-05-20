import { motion } from 'framer-motion'
import { FiLogOut, FiRefreshCw } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'
import Avatar from '../components/Avatar'
import { useExecutorOrders } from '../hooks/useOrders'
import { getStatusInfo } from '../constants/orderStatus'
import { useTelegramPhoto } from '../hooks/useTelegram'

export default function ExecutorHome({ user, onLogout }) {
  const { orders, loading, reload } = useExecutorOrders()
  const displayName = user?.full_name || user?.username || 'друг'
  const tgPhotoUrl = useTelegramPhoto()
  const photoUrl = user?.avatar_url || tgPhotoUrl

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6 gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={displayName} photoUrl={photoUrl} size={40} />
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">Привет, {displayName}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Ваши заказы</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={reload}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            aria-label="Обновить"
          >
            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onLogout}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300"
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
        <div className="text-center py-10 text-sm text-gray-400">Нет заказов</div>
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
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
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
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
