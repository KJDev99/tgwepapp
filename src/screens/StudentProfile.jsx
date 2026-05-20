import { motion } from 'framer-motion'
import { FiEdit, FiLogOut, FiMail, FiBookOpen, FiAward } from 'react-icons/fi'
import ThemeToggle from '../components/ThemeToggle'
import Avatar from '../components/Avatar'
import { haptic, useTelegramPhoto } from '../hooks/useTelegram'

export default function StudentProfile({ user, isDark, onToggleTheme, onLogout, onEditProfile }) {
  const displayName = user?.full_name || user?.username || 'Пользователь'
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Студент</p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {user?.email && <InfoRow icon={FiMail} text={user.email} />}
          {user?.university && <InfoRow icon={FiBookOpen} text={user.university} />}
          {user?.course && <InfoRow icon={FiAward} text={user.course} />}
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
