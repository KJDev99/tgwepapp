import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import LegalDocs from '../components/LegalDocs'
import { haptic } from '../hooks/useTelegram'

export default function LegalDocsModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-5 pb-8 shadow-xl"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Документы и соглашения</h2>
          <button
            onClick={() => {
              haptic('light')
              onClose?.()
            }}
            className="text-gray-400 active:text-gray-600 dark:active:text-gray-200"
            aria-label="Закрыть"
          >
            <FiX size={22} />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          Ознакомьтесь с документами, регулирующими использование сервиса и
          обработку ваших данных.
        </p>

        <LegalDocs />
      </motion.div>
    </motion.div>
  )
}
