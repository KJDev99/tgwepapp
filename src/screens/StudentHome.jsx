import { motion } from 'framer-motion'
import { FiPlus, FiLogOut } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'
import Avatar from '../components/Avatar'
import { useStudentOrders } from '../hooks/useOrders'
import { getStatusInfo } from '../constants/orderStatus'
import { haptic, useTelegramPhoto } from '../hooks/useTelegram'

export default function StudentHome({ user, onLogout, onCreateOrder }) {
  const { orders, loading } = useStudentOrders()
  const displayName = user?.full_name || user?.username || 'друг'
  const tgPhotoUrl = useTelegramPhoto()
  const photoUrl = user?.avatar_url || tgPhotoUrl
  const active = orders.filter((o) => Number(o.status) !== 5 && Number(o.status) !== 6)

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
            <p className="text-gray-500 dark:text-gray-400 text-xs">Ваш путеводитель</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onLogout}
          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 shrink-0"
          aria-label="Выйти"
        >
          <FiLogOut size={18} />
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            haptic('light')
            onCreateOrder?.()
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md"
        >
          <FiPlus size={22} />
          <span>Создать заказ</span>
        </motion.button>
      </motion.div>

      <h2 className="text-base font-semibold mb-3">Ваши активные работы</h2>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : active.length > 0 ? (
        active.map((order, idx) => {
          const info = getStatusInfo(Number(order.status), order.status_label || order.status)
          const progress = Number(order.progress) || 0
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold mb-1 text-sm truncate">{order.title}</h3>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded ${info.tone}`}>
                  {info.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {progress}%
              </p>
            </motion.div>
          )
        })
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 text-sm text-gray-400"
        >
          У вас еще нет активных заказов
        </motion.div>
      )}
    </div>
  )
}
