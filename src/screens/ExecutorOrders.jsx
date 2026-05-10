import { motion } from 'framer-motion'

export default function ExecutorOrders() {
  const orders = [
    { id: 1, title: 'Курсовая по экономике', student: 'Иван', status: 'Принята', deadline: '20 мая' },
    { id: 2, title: 'Практика', student: 'Мария', status: 'Завершена', deadline: '10 мая' },
  ]

  return (
    <div className="min-h-screen pb-24 px-4 pt-4">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-6"
      >
        Мои заказы
      </motion.h1>

      <div className="space-y-3">
        {orders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="font-semibold mb-2">{order.title}</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{order.student}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Завершена'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                }`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Срок: {order.deadline}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
