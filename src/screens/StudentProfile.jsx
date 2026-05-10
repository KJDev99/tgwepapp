import { motion } from 'framer-motion'
import { FiEdit, FiLogOut } from 'react-icons/fi'

export default function StudentProfile({ userName, onLogout }) {
  return (
    <div className="min-h-screen pb-24 px-4 pt-4">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-6"
      >
        Профиль
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {userName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Студент</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-3 rounded-lg flex items-center justify-center gap-2 mb-3 transition"
        >
          <FiEdit size={18} />
          <span>Редактировать профиль</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <FiLogOut size={18} />
          <span>Выход</span>
        </motion.button>
      </motion.div>
    </div>
  )
}
