import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { ORDER_TYPES } from '../constants/mockData'
import { createOrder } from '../api/orders'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'

export default function CreateOrderModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1)
  const [orderType, setOrderType] = useState('')
  const [theme, setTheme] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const totalSteps = 4

  const handleNext = () => {
    if (step === 1 && !orderType) {
      toast.error('Выберите тип работы')
      haptic('error')
      return
    }
    if (step === 2 && !theme.trim()) {
      toast.error('Введите тему')
      haptic('error')
      return
    }
    haptic('selection')
    setStep((s) => s + 1)
  }

  const handleCreate = async () => {
    if (loading) return
    setLoading(true)
    try {
      const payload = {
        title: theme.trim(),
        type_order: { name: orderType },
      }
      if (deadline) payload.deadline = new Date(deadline).toISOString()
      if (description.trim()) payload.description = description.trim()
      if (price.trim()) payload.price = price.trim()

      await createOrder(payload)
      haptic('success')
      toast.success('Заказ создан')
      onCreated?.()
      onClose?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось создать'))
    } finally {
      setLoading(false)
    }
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
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5 max-w-md mx-auto"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-lg font-bold">
            Новый заказ ({step}/{totalSteps})
          </h1>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            aria-label="Закрыть"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pb-2">
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Что вам нужно?</p>
              {ORDER_TYPES.map((type) => {
                const active = orderType === type
                return (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      haptic('selection')
                      setOrderType(type)
                    }}
                    className={`w-full p-3.5 rounded-lg text-left font-semibold text-sm flex items-center justify-between ${
                      active ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <span>{type}</span>
                    {active && <FiCheck size={16} />}
                  </motion.button>
                )
              })}
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium mb-2">Тема / Задание</label>
              <textarea
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Опишите, что вам нужно..."
                maxLength={255}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-32 resize-none text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {theme.length}/255
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Срок</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Цена (опционально)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="5000"
                  inputMode="decimal"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <label className="block text-sm font-medium mb-2">Описание (опционально)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Дополнительные требования..."
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-24 resize-none text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          {step > 1 && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptic('light')
                setStep((s) => s - 1)
              }}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-sm"
            >
              Назад
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={step === totalSteps ? handleCreate : handleNext}
            disabled={loading}
            className={`flex-1 ${
              step === totalSteps
                ? 'bg-green-500 active:bg-green-600'
                : 'bg-blue-500 active:bg-blue-600'
            } disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm`}
          >
            {loading ? 'Создание...' : step === totalSteps ? 'Создать заказ' : 'Далее'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
