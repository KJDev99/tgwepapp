import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { createOrderReview } from '../api/orders'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'
import StarRating from '../components/StarRating'

// Оставить отзыв об исполнителе после завершения заказа
export default function ReviewModal({ orderId, revieweeId, executorName, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (submitting) return
    if (!rating) {
      toast.error('Поставьте оценку')
      haptic('error')
      return
    }
    setSubmitting(true)
    try {
      const payload = { rating, review: text.trim() }
      if (orderId != null) payload.order = Number(orderId)
      // user — id пользователя-исполнителя, которого оценивают
      if (revieweeId != null && revieweeId !== '') payload.user = Number(revieweeId)
      await createOrderReview(orderId, payload)
      haptic('success')
      toast.success('Спасибо за отзыв!')
      onSubmitted?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось отправить отзыв'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65] flex items-end"
      onClick={submitting ? undefined : onClose}
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">Отзыв об исполнителе</h1>
          <button
            onClick={onClose}
            className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            aria-label="Закрыть"
          >
            <FiX size={20} />
          </button>
        </div>

        {executorName && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Оцените работу: <span className="font-semibold text-gray-800 dark:text-gray-200">{executorName}</span>
          </p>
        )}

        <div className="flex justify-center mb-5">
          <StarRating value={rating} onChange={(v) => { haptic('selection'); setRating(v) }} size={36} />
        </div>

        <label className="block text-sm font-medium mb-2">Комментарий</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Расскажите о качестве работы…"
          maxLength={1000}
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-24 resize-none text-sm mb-5"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
          >
            Пропустить
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiStar size={15} /> Отправить
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
