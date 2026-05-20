import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { updateProfile } from '../api/auth'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'

export default function EditProfileModal({ user, onClose, onSaved }) {
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [university, setUniversity] = useState(user?.university || '')
  const [course, setCourse] = useState(user?.course || '')
  const [speciality, setSpeciality] = useState(user?.speciality || '')
  const [experience, setExperience] = useState(user?.experience || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Введите имя')
      haptic('error')
      return
    }
    setLoading(true)
    try {
      const groupIds = (user?.groups || []).map((g) => g.id).filter(Boolean)
      const payload = {
        full_name: fullName.trim(),
        email: email.trim() || null,
        university: university.trim() || null,
        course: course.trim() || null,
        speciality: speciality.trim() || null,
        experience: experience.trim() || null,
      }
      if (groupIds.length > 0) payload.groups = groupIds
      await updateProfile(payload)
      haptic('success')
      toast.success('Профиль обновлён')
      onSaved?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось сохранить'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5 max-w-md mx-auto"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-lg font-bold">Редактировать профиль</h1>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            aria-label="Закрыть"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pb-2">
          <Field label="Имя">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={150}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Университет">
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              maxLength={250}
              className="input"
            />
          </Field>
          <Field label="Курс">
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              maxLength={250}
              className="input"
            />
          </Field>
          <Field label="Специальность">
            <input
              type="text"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              maxLength={250}
              className="input"
            />
          </Field>
          <Field label="Опыт">
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </Field>
        </div>

        <div className="flex gap-2 mt-5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-sm"
          >
            Отмена
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {children}
    </div>
  )
}
