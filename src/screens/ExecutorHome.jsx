import { motion } from 'framer-motion'
import { FiLogOut } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'

export default function ExecutorHome({ userName, onLogout }) {
  const availableOrders = [
    { id: 1, title: 'Курсовая', deadline: '20 мая', price: '5000₽' },
    { id: 2, title: 'ВКР', deadline: '25 июня', price: '15000₽' },
  ]

  return (
    <div className="min-h-screen pb-24 px-4 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold">Привет, {userName}! 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Доступные заказы</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
        >
          <FiLogOut size={20} />
        </motion.button>
      </motion.div>

      <div className="space-y-3">
        {availableOrders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="font-semibold mb-2">{order.title}</h3>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Срок: {order.deadline}</span>
              <span className="text-green-600 dark:text-green-400 font-bold">{order.price}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition"
            >
              Взять заказ
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
