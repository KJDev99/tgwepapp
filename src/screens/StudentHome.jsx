import { motion } from 'framer-motion'
import { FiPlus, FiLogOut } from 'react-icons/fi'
import { useState } from 'react'
import { SkeletonCard } from '../components/Skeleton'

export default function StudentHome({ userName, onLogout }) {
  const [loading, setLoading] = useState(false)

  const mockOrders = [
    { id: 1, title: 'Курсовая по экономике', status: 'В работе', progress: 60 },
  ]

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold">Привет, {userName}! 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Ваш путеводитель</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
        >
          <FiLogOut size={20} />
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <FiPlus size={24} />
          <span>Создать заказ</span>
        </motion.button>
      </motion.div>

      <h2 className="text-lg font-semibold mb-4">Ваши активные работы</h2>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : mockOrders.length > 0 ? (
        mockOrders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="font-semibold mb-1">{order.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Статус: {order.status}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${order.progress}%` }}
                transition={{ delay: 0.3, duration: 1 }}
                className="bg-blue-500 h-2 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{order.progress}%</p>
          </motion.div>
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400">У вас еще нет заказов</p>
        </motion.div>
      )}

      <h2 className="text-lg font-semibold mt-8 mb-4">Последние сообщения</h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center text-gray-400"
      >
        <p>Нет сообщений</p>
      </motion.div>
    </div>
  )
}
