import { motion } from 'framer-motion'
import { FiBook } from 'react-icons/fi'

export default function Welcome({ onSelectRole }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-area bg-gradient-to-b from-blue-50 to-light dark:from-gray-900 dark:to-dark">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="mb-8"
      >
        <FiBook size={80} className="text-blue-500" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold text-center mb-2"
      >
        Добро пожаловать! 👋
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-500 dark:text-gray-400 text-center mb-12"
      >
        Путеводитель студента
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold mb-6 text-center"
      >
        Кто вы?
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs space-y-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectRole('student')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-lg shadow-lg transition"
        >
          Я студент
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectRole('executor')}
          className="w-full bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold py-4 rounded-lg shadow-lg transition"
        >
          Я исполнитель
        </motion.button>
      </motion.div>
    </div>
  )
}
