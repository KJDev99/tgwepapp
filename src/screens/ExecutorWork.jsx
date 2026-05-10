import { motion } from 'framer-motion'
import { FiUpload } from 'react-icons/fi'

export default function ExecutorWork() {
  const works = [
    { id: 1, title: 'Курсовая по экономике', progress: 60 },
    { id: 2, title: 'Практика', progress: 100 },
  ]

  return (
    <div className="min-h-screen pb-24 px-4 pt-4">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold mb-6"
      >
        Мои работы
      </motion.h1>

      <div className="space-y-4">
        {works.map((work, idx) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="font-semibold mb-3">{work.title}</h3>
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${work.progress}%` }}
                  transition={{ delay: 0.3, duration: 1 }}
                  className="bg-blue-500 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{work.progress}%</p>
            </div>
            {work.progress === 100 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              >
                <FiUpload size={16} />
                Сдать работу
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
