import { motion } from 'framer-motion'
import { FiEdit, FiLogOut, FiCheckCircle, FiMail, FiBookOpen } from 'react-icons/fi'
import ThemeToggle from '../components/ThemeToggle'
import Avatar from '../components/Avatar'
import { haptic, useTelegramPhoto } from '../hooks/useTelegram'

export default function ExecutorProfile({ user, isDark, onToggleTheme, onLogout, onEditProfile }) {
  const displayName = user?.full_name || user?.username || 'Пользователь'
  const isVerified = user?.status?.toLowerCase?.() === 'verified' || user?.status === 'active'
  const rating = user?.rating ?? 0
  const skillsCount = user?.skills?.length ?? 0
  const tgPhotoUrl = useTelegramPhoto()
  const photoUrl = user?.avatar_url || tgPhotoUrl

  return (
    <div className="min-h-screen pb-24 px-4 pt-4 safe-area">
      <div className="flex justify-between items-center mb-5">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold"
        >
          Профиль
        </motion.h1>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-5 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={displayName} photoUrl={photoUrl} size={56} />
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{displayName}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-gray-500 dark:text-gray-400">Исполнитель</p>
              {isVerified && (
                <span className="text-[10px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <FiCheckCircle size={10} />
                  Проверен
                </span>
              )}
            </div>
          </div>
        </div>

        {(user?.email || user?.university) && (
          <div className="space-y-2 mb-5">
            {user?.email && <InfoRow icon={FiMail} text={user.email} />}
            {user?.university && <InfoRow icon={FiBookOpen} text={user.university} />}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-5 text-center">
          <div>
            <p className="text-xl font-bold text-blue-500">{rating}</p>
            <p className="text-[10px] text-gray-500">Рейтинг</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-500">{skillsCount}</p>
            <p className="text-[10px] text-gray-500">Навыков</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-500">
              {user?.groups?.length ?? 0}
            </p>
            <p className="text-[10px] text-gray-500">Группы</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            haptic('light')
            onEditProfile?.()
          }}
          className="w-full bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
        >
          <FiEdit size={16} />
          <span>Редактировать профиль</span>
        </motion.button>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={onLogout}
        className="w-full bg-red-500 active:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold"
      >
        <FiLogOut size={16} />
        <span>Выход</span>
      </motion.button>
    </div>
  )
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      <Icon size={14} className="text-gray-400 shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  )
}
