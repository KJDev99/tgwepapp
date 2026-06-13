import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiMessageSquare } from 'react-icons/fi'
import { fetchReviews } from '../api/auth'
import StarRating from './StarRating'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// Отзывы о текущем пользователе (его собственный профиль)
export default function ReviewsSection({ overallRating }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchReviews()
      .then(({ items }) => {
        if (mounted) setReviews(items)
      })
      .catch(() => {
        if (mounted) setReviews([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  // Средний рейтинг: приоритет — значение из профиля, иначе считаем из отзывов
  const computedAvg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length
      : 0
  const avg = Number(overallRating) || computedAvg

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-5 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-yellow-400/10 text-yellow-500 flex items-center justify-center shrink-0">
            <FiMessageSquare size={18} />
          </span>
          <h3 className="text-base font-semibold">Отзывы</h3>
        </div>
        {(avg > 0 || reviews.length > 0) && (
          <div className="flex items-center gap-2">
            <StarRating value={avg} size={15} />
            <span className="text-sm font-bold">{avg ? avg.toFixed(1) : '—'}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-5">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Пока нет отзывов
        </p>
      ) : (
        <div className="space-y-2">
          {reviews.map((r, idx) => (
            <div
              key={r.id ?? idx}
              className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <StarRating value={r.rating} size={13} />
                <span className="text-[11px] text-gray-400">{formatDate(r.created_at)}</span>
              </div>
              {r.review ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {r.review}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">Без комментария</p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
