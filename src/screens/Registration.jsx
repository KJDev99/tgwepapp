import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiCamera } from 'react-icons/fi'

export default function Registration({ onRegister }) {
  const [role, setRole] = useState(null)
  const [name, setName] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [description, setDescription] = useState('')
  const [selectedOptions, setSelectedOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedSpec, setExpandedSpec] = useState(false)
  const fileInputRef = useRef(null)

  const executorOptions = ['Web разработка', 'Мобильная разработка', 'Дизайн', 'Писание контента', 'Переводы']

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const toggleOption = (option) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Пожалуйста, введите имя')
      return
    }

    if (role === 'executor' && selectedOptions.length === 0) {
      toast.error('Пожалуйста, выберите хотя бы одну специальность')
      return
    }

    setLoading(true)
    setTimeout(() => {
      onRegister({
        name,
        image,
        role,
        ...(role === 'executor' && { description, specializations: selectedOptions })
      })
      toast.success('Добро пожаловать!')
      setLoading(false)
    }, 500)
  }

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-area">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs"
        >
          <h1 className="text-3xl font-bold mb-2 text-center">Добро пожаловать</h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Выберите вашу роль</p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRole('student')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition shadow-lg"
            >
              👨‍🎓 Студент
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRole('executor')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition shadow-lg"
            >
              ⚙️ Исполнитель
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 safe-area bg-light dark:bg-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs"
      >
        <motion.button
          onClick={() => setRole(null)}
          className="text-blue-500 hover:text-blue-600 mb-6 text-sm font-medium flex items-center gap-1"
        >
          ← Назад
        </motion.button>

        <h1 className="text-3xl font-bold mb-1 text-center">
          {role === 'student' ? 'Профиль студента' : 'Профиль исполнителя'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">Заполните информацию</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold mb-3">Фото профиля</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:border-blue-500 dark:hover:border-blue-400 transition cursor-pointer group"
            >
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                  <span className="text-xs text-gray-500 group-hover:text-blue-500">Нажмите чтобы изменить</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FiCamera size={32} className="text-gray-400 group-hover:text-blue-500 transition" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Загрузите фото</span>
                  <span className="text-xs text-gray-500">JPG, PNG до 10MB</span>
                </div>
              )}
            </motion.button>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Ваше имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            />
          </div>

          {/* Executor Only Fields */}
          <AnimatePresence>
            {role === 'executor' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5"
              >
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2">О себе</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Расскажите о ваших навыках и опыте..."
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition resize-none"
                    rows="3"
                  />
                </div>

                {/* Specializations */}
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedSpec(!expandedSpec)}
                    className="w-full text-sm font-semibold mb-2 text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition flex justify-between items-center"
                  >
                    <span>
                      Специальности {selectedOptions.length > 0 && <span className="text-blue-500">({selectedOptions.length})</span>}
                    </span>
                    <span className="text-lg">{expandedSpec ? '−' : '+'}</span>
                  </button>

                  <AnimatePresence>
                    {expandedSpec && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        {executorOptions.map(option => (
                          <motion.label
                            key={option}
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedOptions.includes(option)}
                                onChange={() => toggleOption(option)}
                                className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
                              />
                            </div>
                            <span className="text-sm font-medium">{option}</span>
                          </motion.label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition mt-8 shadow-lg"
          >
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
