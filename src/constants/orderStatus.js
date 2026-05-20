export const ORDER_STATUS = {
  1: { label: 'Создан', color: 'gray', tone: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  2: { label: 'Исполнитель назначен', color: 'blue', tone: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' },
  3: { label: 'В работе', color: 'yellow', tone: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' },
  4: { label: 'На проверке', color: 'purple', tone: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' },
  5: { label: 'Завершён', color: 'green', tone: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' },
  6: { label: 'Отменён', color: 'red', tone: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' },
}

export function getStatusInfo(status, label) {
  if (typeof status === 'number' && ORDER_STATUS[status]) return ORDER_STATUS[status]
  if (label) {
    const tone = 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
    return { label, color: 'blue', tone }
  }
  return { label: '—', color: 'gray', tone: ORDER_STATUS[1].tone }
}
