import { FiSun, FiMoon } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-yellow-400"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
    </motion.button>
  )
}
