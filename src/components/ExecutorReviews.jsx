import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiMessageSquare } from 'react-icons/fi'
import { fetchUserReviews } from '../api/auth'
import { haptic } from '../hooks/useTelegram'
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

// Раскрывающийся блок отзывов о конкретном исполнителе (по userId).
// Отзывы подгружаются при первом открытии.
export default function ExecutorReviews({ userId }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const toggle = async () => {
    haptic('selection')
    const next = !open
    setOpen(next)
    if (next && !loaded && userId != null) {
      setLoading(true)
      try {
        const { items } = await fetchUserReviews(userId)
        setItems(items)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
        setLoaded(true)
      }
    }
  }

  if (userId == null) return null

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500 active:text-blue-600"
      >
        <FiMessageSquare size={12} />
        Отзывы
        <FiChevronDown
          size={12}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1.5">
              {loading ? (
                <div className="flex justify-center py-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-[11px] text-gray-400 py-1">Пока нет отзывов</p>
              ) : (
                items.map((r, idx) => (
                  <div
                    key={r.id ?? idx}
                    className="bg-white dark:bg-gray-800 rounded-lg p-2"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <StarRating value={r.rating} size={11} />
                      <span className="text-[10px] text-gray-400">
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                    {r.review ? (
                      <p className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {r.review}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">Без комментария</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
