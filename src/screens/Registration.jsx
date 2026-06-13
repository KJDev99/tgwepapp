import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUser, FiBriefcase, FiArrowLeft, FiCheck, FiChevronDown, FiShield } from 'react-icons/fi'
import { fetchGroups, fetchTagSkills, updateProfile, updateSkills, changeGroup } from '../api/auth'
import { haptic, useTelegramPhoto } from '../hooks/useTelegram'
import { extractErrorMessage } from '../api/client'
import Avatar from '../components/Avatar'
import LegalDocs from '../components/LegalDocs'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth.jsx'

const EXECUTOR_KEYWORDS = ['executor', 'исполнитель', 'performer', 'ijrochi']

function isExecutorGroup(group) {
  const n = (group?.name || '').toLowerCase()
  return EXECUTOR_KEYWORDS.some((k) => n.includes(k))
}

export default function Registration({ onCompleted, isChangingRole = false, onCancelChange }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [skills, setSkills] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [groupsError, setGroupsError] = useState(null)

  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [step, setStep] = useState('role')
  const [fullName, setFullName] = useState('')
  const [experience, setExperience] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState([])
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingGroupChange, setPendingGroupChange] = useState(null)
  const [legalReady, setLegalReady] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)

  const tgPhotoUrl = useTelegramPhoto()
  const skillsRef = useRef(null)

  useEffect(() => {
    setLoadingGroups(true)
    fetchGroups()
      .then(setGroups)
      .catch((e) => setGroupsError(extractErrorMessage(e, 'Не удалось загрузить роли')))
      .finally(() => setLoadingGroups(false))
  }, [])

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) || null,
    [groups, selectedGroupId]
  )
  const isExecutor = selectedGroup ? isExecutorGroup(selectedGroup) : false

  useEffect(() => {
    if (!isExecutor) return
    fetchTagSkills()
      .then(setSkills)
      .catch(() => setSkills([]))
  }, [isExecutor])

  useEffect(() => {
    if (!skillsOpen) return
    const handler = (e) => {
      if (skillsRef.current && !skillsRef.current.contains(e.target)) {
        setSkillsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [skillsOpen])

  const toggleSkill = (id) => {
    haptic('selection')
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleSelectRole = (group) => {
    haptic('selection')
    if (isChangingRole) {
      const currentGroup = user?.groups?.[0]
      if (currentGroup?.id === group.id) {
        onCancelChange?.()
        return
      }
      setPendingGroupChange(group)
      return
    }
    setSelectedGroupId(group.id)
    setStep('profile')
  }

  const confirmGroupChange = async () => {
    if (!pendingGroupChange) return
    setSaving(true)
    try {
      await changeGroup(pendingGroupChange.id)
      haptic('success')
      toast.success('Роль успешно изменена')
      await onCompleted?.()
      setPendingGroupChange(null)
    } catch (err) {
      haptic('error')
      toast.error(extractErrorMessage(err, 'Не удалось сменить роль'))
    } finally {
      setSaving(false)
    }
  }

  const proceedToLegal = () => {
    if (!fullName.trim()) {
      toast.error('Введите имя')
      haptic('error')
      return
    }
    if (!selectedGroupId) {
      toast.error('Выберите роль')
      haptic('error')
      return
    }
    haptic('selection')
    setStep('legal')
  }

  const save = async () => {
    if (!fullName.trim()) {
      toast.error('Введите имя')
      haptic('error')
      return
    }
    if (!selectedGroupId) {
      toast.error('Выберите роль')
      haptic('error')
      return
    }
    if (!legalAccepted) {
      toast.error('Подтвердите согласие с документами')
      haptic('error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        full_name: fullName.trim(),
        groups: [selectedGroupId],
      }
      if (isExecutor && experience.trim()) payload.experience = experience.trim()
      await updateProfile(payload)
      if (isExecutor && selectedSkillIds.length > 0) {
        try {
          await updateSkills(selectedSkillIds)
        } catch {
          // skills optional
        }
      }
      haptic('success')
      toast.success('Профиль сохранён')
      await onCompleted?.()
    } catch (err) {
      haptic('error')
      toast.error(extractErrorMessage(err, 'Не удалось сохранить'))
    } finally {
      setSaving(false)
    }
  }

  if (loadingGroups) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (groupsError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-gray-500 mb-4">{groupsError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Перезагрузить
        </button>
      </div>
    )
  }

  if (pendingGroupChange) {
    const currentGroup = user?.groups?.[0]
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-area bg-gradient-to-b from-blue-50/40 to-light dark:from-gray-900 dark:to-dark">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold mb-6 text-center"
        >
          Подтвердите смену роли
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col items-center gap-4"
        >
          <div className="flex items-center justify-between w-full text-center">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-500 block mb-1">Текущая роль</span>
              <span className="font-semibold text-xs bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg block truncate capitalize">
                {currentGroup?.name || '—'}
              </span>
            </div>
            <div className="px-2 text-gray-400 font-bold">→</div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-500 block mb-1">Новая роль</span>
              <span className="font-semibold text-xs bg-blue-500 text-white px-2.5 py-1.5 rounded-lg block truncate capitalize">
                {pendingGroupChange.name}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 leading-relaxed">
            Вы уверены, что хотите сменить роль? Данные вашего профиля останутся прежними, но изменится доступный функционал.
          </p>
        </motion.div>

        <div className="w-full max-w-xs space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={confirmGroupChange}
            disabled={saving}
            className="w-full bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            {saving ? 'Смена...' : 'Подтвердить'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setPendingGroupChange(null)}
            disabled={saving}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3.5 rounded-xl"
          >
            Отмена
          </motion.button>
        </div>
      </div>
    )
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 safe-area bg-gradient-to-b from-blue-50/40 to-light dark:from-gray-900 dark:to-dark relative">
        {isChangingRole && (
          <motion.button
            onClick={onCancelChange}
            whileTap={{ scale: 0.95 }}
            className="text-blue-500 absolute top-4 left-4 text-sm font-medium flex items-center gap-1"
            style={{ top: 'calc(16px + env(safe-area-inset-top))' }}
          >
            <FiArrowLeft size={16} />
            Назад
          </motion.button>
        )}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="mb-6"
        >
          <Logo size={96} className="rounded-[22px] shadow-xl shadow-black/10 dark:shadow-black/40" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-center mb-2"
        >
          Добро пожаловать
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center"
        >
          Выберите вашу роль
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-xs space-y-3"
        >
          {groups.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">Нет доступных ролей</p>
          ) : (
            groups.map((g) => {
              const exec = isExecutorGroup(g)
              return (
                <motion.button
                  key={g.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectRole(g)}
                  className={`w-full font-semibold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-white ${
                    exec ? 'bg-green-500 active:bg-green-600' : 'bg-blue-500 active:bg-blue-600'
                  }`}
                >
                  {exec ? <FiBriefcase size={18} /> : <FiUser size={18} />}
                  <span className="capitalize">{g.name}</span>
                </motion.button>
              )
            })
          )}
        </motion.div>
      </div>
    )
  }

  if (step === 'legal') {
    return (
      <div className="min-h-screen flex flex-col px-5 pt-4 pb-28 safe-area">
        <div className="w-full max-w-md mx-auto">
          <motion.button
            onClick={() => {
              haptic('selection')
              setStep('profile')
            }}
            whileTap={{ scale: 0.95 }}
            className="text-blue-500 mb-5 text-sm font-medium flex items-center gap-1"
          >
            <FiArrowLeft size={16} />
            Назад
          </motion.button>

          <div className="flex flex-col items-center mb-6 text-center">
            <div className="mb-3 p-3.5 rounded-2xl bg-blue-500/10">
              <FiShield size={40} className="text-blue-500" />
            </div>
            <h1 className="text-xl font-bold">Документы и соглашения</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 leading-relaxed max-w-xs">
              Перед началом работы откройте и прочитайте оба документа. Это
              необходимо для использования сервиса и подключения оплаты.
            </p>
          </div>

          <LegalDocs
            requireOpen
            onReadyChange={(r) => {
              setLegalReady(r)
              setLegalAccepted(r)
            }}
          />

          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-4 leading-relaxed text-center">
            Отметьте галочкой каждый документ — это подтверждает, что вы
            ознакомились с ним и принимаете его условия.
          </p>

          {!legalReady && (
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              Откройте и отметьте оба документа, чтобы продолжить
            </p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={save}
            disabled={saving || !legalAccepted}
            className="w-full bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white font-semibold py-4 rounded-xl mt-5 shadow-md flex items-center justify-center gap-2"
          >
            {saving ? 'Сохранение...' : 'Завершить регистрацию'}
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-4 pb-24 safe-area">
      <div className="w-full max-w-md mx-auto">
        <motion.button
          onClick={() => setStep('role')}
          whileTap={{ scale: 0.95 }}
          className="text-blue-500 mb-5 text-sm font-medium flex items-center gap-1"
        >
          <FiArrowLeft size={16} />
          Назад
        </motion.button>

        <div className="flex flex-col items-center mb-6">
          <Avatar name={fullName || '?'} photoUrl={tgPhotoUrl} size={72} className="mb-3" />
          <h1 className="text-xl font-bold text-center">
            {isExecutor ? 'Профиль исполнителя' : 'Профиль студента'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm mt-1">
            {isExecutor ? 'Заполните информацию' : 'Введите ваше имя'}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            proceedToLegal()
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold mb-2">Ваше имя</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иван Иванов"
              maxLength={150}
              className="input"
              autoFocus
            />
          </div>

          <AnimatePresence initial={false}>
            {isExecutor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-visible"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2">Опыт</label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Расскажите о вашем опыте..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <div ref={skillsRef} className="relative">
                  <label className="block text-sm font-semibold mb-2">Специальности</label>
                  <button
                    type="button"
                    onClick={() => {
                      haptic('selection')
                      setSkillsOpen((v) => !v)
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm flex justify-between items-center"
                  >
                    <span className={selectedSkillIds.length === 0 ? 'text-gray-400' : ''}>
                      {selectedSkillIds.length === 0
                        ? 'Выберите специальности'
                        : `Выбрано: ${selectedSkillIds.length}`}
                    </span>
                    <FiChevronDown
                      size={16}
                      className={`transition-transform ${skillsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {skillsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                      >
                        {skills.length === 0 ? (
                          <p className="p-3 text-sm text-gray-400 text-center">
                            Загрузка...
                          </p>
                        ) : (
                          skills.map((s) => {
                            const active = selectedSkillIds.includes(s.id)
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => toggleSkill(s.id)}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition ${
                                  active
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                                    : 'active:bg-gray-50 dark:active:bg-gray-700'
                                }`}
                              >
                                <span>{s.name}</span>
                                {active && <FiCheck size={16} />}
                              </button>
                            )
                          })
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedSkillIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skills
                        .filter((s) => selectedSkillIds.includes(s.id))
                        .map((s) => (
                          <span
                            key={s.id}
                            className="text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1"
                          >
                            {s.name}
                            <button
                              type="button"
                              onClick={() => toggleSkill(s.id)}
                              className="opacity-70 hover:opacity-100"
                              aria-label="Убрать"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-blue-500 active:bg-blue-600 text-white font-semibold py-4 rounded-xl mt-4 shadow-md"
          >
            Продолжить
          </motion.button>
        </form>
      </div>
    </div>
  )
}
