import { motion } from 'framer-motion'
import { FiTrendingUp } from 'react-icons/fi'

export default function ExecutorFinance() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-4">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-6"
      >
        Финансы
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 mb-6 text-white shadow-lg"
      >
        <p className="text-sm opacity-90 mb-2">Доступно</p>
        <h2 className="text-3xl font-bold mb-4">12 500₽</h2>
        <p className="text-sm opacity-75">В обработке: 3 000₽</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Вывести деньги
        </motion.button>
      </motion.div>

      <h3 className="text-lg font-semibold mb-4">История операций</h3>
      <div className="space-y-3">
        {[
          { amount: '+ 5 000₽', order: 'Заказ #12', date: '2 часа назад' },
          { amount: '+ 7 500₽', order: 'Заказ #15', date: '5 часов назад' },
          { amount: '- 2 000₽', order: 'Вывод средств', date: '1 день назад' },
        ].map((tx, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div>
              <p className="font-semibold text-sm">{tx.order}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tx.date}</p>
            </div>
            <span className={tx.amount.startsWith('+') ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold'}>
              {tx.amount}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
