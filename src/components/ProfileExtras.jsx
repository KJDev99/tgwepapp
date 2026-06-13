import { motion } from 'framer-motion'
import { FiSmartphone, FiHeadphones, FiChevronRight } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { SUPPORT_URL } from '../api/endpoints'
import { haptic, openLink, canAddToHomeScreen, addToHomeScreen } from '../hooks/useTelegram'

// Доп. действия в профиле: добавить на главный экран + техподдержка
export default function ProfileExtras() {
  const showHomeScreen = canAddToHomeScreen()

  const handleAddHome = () => {
    haptic('light')
    const ok = addToHomeScreen()
    if (!ok) toast('Недоступно в этой версии Telegram')
  }

  const handleSupport = () => {
    haptic('light')
    openLink(SUPPORT_URL)
  }

  return (
    <div className="space-y-3 mb-5">
      {showHomeScreen && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleAddHome}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/60 py-3.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium"
        >
          <span className="w-9 h-9 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
            <FiSmartphone size={18} />
          </span>
          <span className="flex-1 text-left">Добавить на главный экран</span>
          <FiChevronRight size={18} className="text-gray-400 shrink-0" />
        </motion.button>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleSupport}
        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700/60 py-3.5 px-4 rounded-xl flex items-center gap-3 text-sm font-medium"
      >
        <span className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <FiHeadphones size={18} />
        </span>
        <span className="flex-1 text-left">Техническая поддержка</span>
        <FiChevronRight size={18} className="text-gray-400 shrink-0" />
      </motion.button>
    </div>
  )
}
