import { lazy, Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEdit, FiLogOut, FiCheckCircle, FiMail, FiBookOpen, FiShield, FiChevronRight } from 'react-icons/fi'
import ThemeToggle from '../components/ThemeToggle'
import Avatar from '../components/Avatar'
import CardsSection from '../components/CardsSection'
import ReviewsSection from '../components/ReviewsSection'
import { haptic, useTelegramPhoto } from '../hooks/useTelegram'

const LegalDocsModal = lazy(() => import('../modals/LegalDocsModal'))

export default function ExecutorProfile({ user, isDark, onToggleTheme, onLogout, onEditProfile }) {
  const displayName = user?.full_name || user?.username || 'Пользователь'
  const isVerified = user?.status?.toLowerCase?.() === 'verified' || user?.status === 'active'
  const tgPhotoUrl = useTelegramPhoto()
  const photoUrl = user?.avatar_url || tgPhotoUrl
  const [showLegal, setShowLegal] = useState(false)

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

        {user?.experience && (
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
              Опыт
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
              {user.experience}
            </p>
          </div>
        )}

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

      <CardsSection />

      <ReviewsSection overallRating={user?.rating} />

      <motion.button
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onClick={() => {
          haptic('light')
          setShowLegal(true)
        }}
        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/60 py-3.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium mb-5"
      >
        <span className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <FiShield size={18} />
        </span>
        <span className="flex-1 text-left">Документы и соглашения</span>
        <FiChevronRight size={18} className="text-gray-400 shrink-0" />
      </motion.button>

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

      <Suspense fallback={null}>
        <AnimatePresence>
          {showLegal && <LegalDocsModal onClose={() => setShowLegal(false)} />}
        </AnimatePresence>
      </Suspense>
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
