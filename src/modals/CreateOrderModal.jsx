import { motion } from 'framer-motion'
import { FiX, FiUpload } from 'react-icons/fi'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function CreateOrderModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [orderType, setOrderType] = useState('')
  const [theme, setTheme] = useState('')
  const [subject, setSubject] = useState('')
  const [deadline, setDeadline] = useState('')
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)

  const orderTypes = ['ВКР', 'Курсовая', 'Практика', 'Сессия']
  const subjects = ['Экономика', 'Право', 'Программирование', 'Юриспруденция', 'Психология']

  const handleNext = () => {
    if (step === 1 && !orderType) {
      toast.error('Выберите тип работы')
      return
    }
    if (step === 2 && !theme) {
      toast.error('Введите тему')
      return
    }
    if (step === 3 && !subject) {
      toast.error('Выберите предмет')
      return
    }
    if (step === 4 && !deadline) {
      toast.error('Выберите срок')
      return
    }
    if (step < 5) setStep(step + 1)
  }

  const handleCreate = () => {
    setLoading(true)
    setTimeout(() => {
      toast.success('Заказ создан!')
      onClose()
    }, 1000)
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
          <h1 className="text-xl font-bold">Создать заказ (Шаг {step}/5)</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <div className="max-h-96 overflow-y-auto pb-4">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Что вам нужно?</p>
              {orderTypes.map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOrderType(type)}
                  className={`w-full p-4 rounded-lg text-left font-semibold transition ${orderType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium mb-2">Тема / Задание</label>
              <textarea
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Опишите, что вам нужно..."
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-32 resize-none"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Предмет</p>
              {subjects.map((subj) => (
                <motion.button
                  key={subj}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSubject(subj)}
                  className={`w-full p-3 rounded-lg text-left font-medium transition ${subject === subj
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                >
                  {subj}
                </motion.button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div>
              <label className="block text-sm font-medium mb-2">Срок</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {step === 5 && (
            <div>
              <label className="block text-sm font-medium mb-2">Требования</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Дополнительные требования или файлы..."
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-28 resize-none"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-4 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
              >
                <FiUpload size={18} />
                <span>Загрузить файл</span>
              </motion.button>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold"
            >
              Назад
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={step === 5 ? handleCreate : handleNext}
            disabled={loading}
            className={`flex-1 ${step === 5 ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50 text-white py-3 rounded-lg font-semibold`}
          >
            {loading ? 'Создание...' : step === 5 ? '💳 Оплатить и создать' : 'Далее'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
