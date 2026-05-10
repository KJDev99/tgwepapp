export function SkeletonCard() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 mb-3 animate-pulse-subtle">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
  )
}

export function SkeletonText() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 animate-pulse-subtle mb-2"></div>
  )
}

export function SkeletonButton() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded h-10 animate-pulse-subtle mb-3"></div>
  )
}
