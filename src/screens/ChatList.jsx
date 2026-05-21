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
          {rooms.map((room, idx) => {
            const otherUser = room.other_user
            const userName =
              (otherUser && typeof otherUser === 'object'
                ? otherUser.full_name || otherUser.username || otherUser.name
                : otherUser) || 'Чат'
            const userPhoto =
              otherUser && typeof otherUser === 'object'
                ? otherUser.avatar_url || otherUser.photo_url
                : undefined
            const lastMessage = room.last_message
            const lastText =
              lastMessage && typeof lastMessage === 'object'
                ? lastMessage.has_attachments
                  ? lastMessage.text || '📎 Вложение'
                  : lastMessage.text
                : lastMessage
            const lastTime =
              (lastMessage && typeof lastMessage === 'object' && lastMessage.created_at) ||
              room.updated_at
            return (
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
                <Avatar name={userName} photoUrl={userPhoto} size={44} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{userName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {lastText || 'Нет сообщений'}
                  </p>
                </div>
                {lastTime && (
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(lastTime).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
