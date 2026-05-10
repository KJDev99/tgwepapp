import { motion } from 'framer-motion'
import { FiFilter } from 'react-icons/fi'

export default function StudentOrders() {
  const mockOrders = [
    { id: 1, title: 'Курсовая по экономике', executor: 'Анна', rating: 4.8, status: 'В работе' },
    { id: 2, title: 'ВКР по информатике', executor: 'Петр', rating: 4.9, status: 'Ожидание' },
  ]

  return (
    <div className="min-h-screen pb-24 px-4 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-2xl font-bold">Мои заказы</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <FiFilter size={20} />
        </motion.button>
      </motion.div>

      <div className="space-y-3">
        {mockOrders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="font-semibold mb-2">{order.title}</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Исполнитель: {order.executor}</p>
                <p className="text-xs text-gray-400">Рейтинг: ⭐ {order.rating}</p>
              </div>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                {order.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
