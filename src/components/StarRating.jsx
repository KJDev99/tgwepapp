import { FiStar } from 'react-icons/fi'

// Звёздный рейтинг. Режим просмотра (value) или выбора (onChange).
export default function StarRating({
  value = 0,
  onChange,
  size = 18,
  max = 5,
  className = '',
}) {
  const interactive = typeof onChange === 'function'
  const rounded = Math.round(Number(value) || 0)

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1
        const filled = idx <= rounded
        const star = (
          <FiStar
            size={size}
            className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
            style={filled ? { fill: 'currentColor' } : undefined}
          />
        )
        if (!interactive) return <span key={idx}>{star}</span>
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onChange(idx)}
            className="p-0.5 active:scale-90 transition-transform"
            aria-label={`${idx} из ${max}`}
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}
