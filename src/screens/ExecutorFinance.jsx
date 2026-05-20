import { motion } from 'framer-motion'
import { FiArrowDownCircle, FiArrowUpCircle, FiInfo } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { FINANCE_TRANSACTIONS } from '../constants/mockData'
import { haptic } from '../hooks/useTelegram'

export default function ExecutorFinance() {
  const handleWithdraw = () => {
    haptic('light')
    toast('Раздел в разработке')
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold mb-5"
      >
        Финансы
      </motion.h1>

      <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
        <FiInfo size={14} className="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          Раздел финансов появится в следующей версии API
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 mb-5 text-white shadow-md"
      >
        <p className="text-xs opacity-90 mb-1">Доступно</p>
        <h2 className="text-3xl font-bold mb-2">— ₽</h2>
        <p className="text-xs opacity-75">В обработке: — ₽</p>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleWithdraw}
        className="w-full bg-green-500 active:bg-green-600 text-white font-semibold py-3 rounded-lg mb-5"
      >
        Вывести деньги
      </motion.button>

      <h3 className="text-base font-semibold mb-3">История операций</h3>
      <div className="space-y-2">
        {FINANCE_TRANSACTIONS.map((tx, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 flex justify-between items-center shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              {tx.type === 'in' ? (
                <FiArrowDownCircle size={20} className="text-green-500" />
              ) : (
                <FiArrowUpCircle size={20} className="text-red-500" />
              )}
              <div>
                <p className="font-semibold text-sm">{tx.order}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tx.date}</p>
              </div>
            </div>
            <span
              className={
                tx.type === 'in'
                  ? 'text-green-600 dark:text-green-400 font-bold text-sm'
                  : 'text-red-600 dark:text-red-400 font-bold text-sm'
              }
            >
              {tx.amount}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
