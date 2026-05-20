import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiMessageCircle, FiRefreshCw } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'
import Avatar from '../components/Avatar'
import { fetchChatRooms } from '../api/chat'
import { haptic } from '../hooks/useTelegram'

export default function ChatList({ onOpenChat }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetchChatRooms()
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold">Чаты</h1>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={load}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
          aria-label="Обновить"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : rooms.length === 0 ? (
        <div className="text-center py-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
            <FiMessageCircle size={24} />
          </div>
          <p className="text-sm text-gray-400">Пока нет чатов</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room, idx) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptic('selection')
                onOpenChat(room.id)
              }}
              className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3"
            >
              <Avatar name={room.other_user || '?'} size={44} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">{room.other_user || 'Чат'}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {room.last_message || 'Нет сообщений'}
                </p>
              </div>
              {room.updated_at && (
                <span className="text-[10px] text-gray-400 shrink-0">
                  {new Date(room.updated_at).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
