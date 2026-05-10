import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function EditProfileModal({ userName, onClose, onSave }) {
  const [name, setName] = useState(userName)
  const [university, setUniversity] = useState('МГУ')
  const [specialization, setSpecialization] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Введите имя')
      return
    }
    setLoading(true)
    setTimeout(() => {
      onSave(name)
      toast.success('Профиль обновлен!')
      setLoading(false)
    }, 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Редактировать профиль</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Вуз</label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Специализация (опционально)</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Ваша специализация"
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold"
          >
            Отмена
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
