import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiCheck, FiPaperclip, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { createOrder, fetchOrderTypes } from '../api/orders'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'
import { prepareFile, validateFile, formatBytes } from '../utils/files'
import FilePreview from '../components/FilePreview'

const MAX_TOTAL_FILES = 10
const MAX_ITEMS = 10

export default function CreateOrderModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1)
  const [orderTypes, setOrderTypes] = useState([])
  const [orderTypesLoading, setOrderTypesLoading] = useState(true)
  const [orderTypeId, setOrderTypeId] = useState(null)
  const [theme, setTheme] = useState('')
  const [items, setItems] = useState([''])
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingFiles, setProcessingFiles] = useState(false)

  const totalSteps = 7

  useEffect(() => {
    let mounted = true
    fetchOrderTypes()
      .then((items) => {
        if (mounted) setOrderTypes(items)
      })
      .catch(() => {
        if (mounted) toast.error('Не удалось загрузить типы работ')
      })
      .finally(() => {
        if (mounted) setOrderTypesLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const orderTypeName = orderTypes.find((t) => t.id === orderTypeId)?.name || ''
  const filledItems = items.map((s) => s.trim()).filter(Boolean)

  const handleNext = () => {
    if (step === 1 && !orderTypeId) {
      toast.error('Выберите тип работы')
      haptic('error')
      return
    }
    if (step === 2 && !theme.trim()) {
      toast.error('Введите тему')
      haptic('error')
      return
    }
    if (step === 3 && filledItems.length === 0) {
      toast.error('Добавьте хотя бы один предмет')
      haptic('error')
      return
    }
    haptic('selection')
    setStep((s) => s + 1)
  }

  const updateItem = (idx, val) => {
    setItems((prev) => prev.map((s, i) => (i === idx ? val : s)))
  }

  const addItem = () => {
    if (items.length >= MAX_ITEMS) return
    const last = items[items.length - 1]
    if (!last || !last.trim()) {
      toast.error('Сначала заполните предыдущий пункт')
      haptic('error')
      return
    }
    haptic('light')
    setItems((prev) => [...prev, ''])
  }

  const removeItem = (idx) => {
    if (items.length <= 1) return
    haptic('selection')
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const addFiles = async (incoming) => {
    if (incoming.length === 0) return
    if (files.length + incoming.length > MAX_TOTAL_FILES) {
      toast.error(`Максимум ${MAX_TOTAL_FILES} файлов`)
      haptic('error')
      return
    }
    setProcessingFiles(true)
    const accepted = []
    for (const raw of incoming) {
      const check = validateFile(raw)
      if (!check.ok) {
        toast.error(check.reason)
        haptic('error')
        continue
      }
      try {
        const prepared = await prepareFile(raw)
        accepted.push(prepared)
      } catch {
        toast.error(`${raw.name}: ошибка обработки`)
      }
    }
    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted])
      haptic('light')
    }
    setProcessingFiles(false)
  }

  const removeFile = (i) => {
    haptic('selection')
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleCreate = async () => {
    if (loading || processingFiles) return
    setLoading(true)
    try {
      const payload = {
        title: theme.trim(),
        type_order: orderTypeId,
        items: filledItems,
      }
      if (deadline) payload.deadline = new Date(deadline).toISOString()
      if (description.trim()) payload.description = description.trim()
      if (price.trim()) payload.price = price.trim()
      if (files.length > 0) payload.files = files

      await createOrder(payload)
      haptic('success')
      toast.success('Заказ создан')
      onCreated?.()
      onClose?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось создать'))
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
          <h1 className="text-lg font-bold">
            Новый заказ ({step}/{totalSteps})
          </h1>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            aria-label="Закрыть"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pb-2">
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Что вам нужно?</p>
              {orderTypesLoading ? (
                <p className="text-sm text-gray-500 text-center py-4">Загрузка...</p>
              ) : orderTypes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Типы работ недоступны
                </p>
              ) : (
                orderTypes.map((type) => {
                  const active = orderTypeId === type.id
                  return (
                    <motion.button
                      key={type.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        haptic('selection')
                        setOrderTypeId(type.id)
                      }}
                      className={`w-full p-3.5 rounded-lg text-left font-semibold text-sm flex items-center justify-between ${
                        active ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <span>{type.name}</span>
                      {active && <FiCheck size={16} />}
                    </motion.button>
                  )
                })
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium mb-2">Тема / Задание</label>
              <textarea
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Опишите, что вам нужно..."
                maxLength={255}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-32 resize-none text-sm"
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">{theme.length}/255</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium mb-2">Предметы</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Добавьте предметы (до {MAX_ITEMS})
              </p>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem(idx, e.target.value)}
                      placeholder={`Предмет ${idx + 1}`}
                      maxLength={100}
                      className="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                    />
                    {items.length > 1 && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        aria-label="Удалить"
                      >
                        <FiTrash2 size={16} />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
              {items.length < MAX_ITEMS && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={addItem}
                  className="mt-3 w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1 active:border-blue-500"
                >
                  <FiPlus size={16} />
                  Добавить предмет
                </motion.button>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Срок</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Цена (опционально)</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
                  placeholder="5000"
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <label className="block text-sm font-medium mb-2">Описание (опционально)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Дополнительные требования..."
                className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-24 resize-none text-sm"
              />
            </div>
          )}

          {step === 6 && (
            <div>
              <label className="block text-sm font-medium mb-2">Файлы (опционально)</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Изображения автоматически сжимаются · до {MAX_TOTAL_FILES} файлов
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <FilePickerButton accept="image/*" onPick={addFiles} icon={FiImage} label="Фото" />
                <FilePickerButton onPick={addFiles} icon={FiPaperclip} label="Файл" />
              </div>
              {processingFiles && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center py-1">
                  Обработка...
                </p>
              )}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((f, i) => (
                    <FilePreview
                      key={`${f.name}-${i}`}
                      file={f}
                      onRemove={() => removeFile(i)}
                      size="lg"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Проверьте данные перед отправкой
              </p>
              <SummaryRow label="Тип работы" value={orderTypeName} />
              <SummaryRow label="Тема" value={theme.trim()} multiline />
              <SummaryRow
                label="Предметы"
                value={filledItems.length > 0 ? filledItems.join(', ') : '—'}
                multiline
              />
              <SummaryRow
                label="Срок"
                value={deadline ? new Date(deadline).toLocaleDateString('ru-RU') : '—'}
              />
              <SummaryRow label="Цена" value={price.trim() ? `${price.trim()} ₽` : '—'} />
              <SummaryRow
                label="Описание"
                value={description.trim() || '—'}
                multiline
              />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  Файлы ({files.length})
                </p>
                {files.length === 0 ? (
                  <p className="text-sm">—</p>
                ) : (
                  <ul className="space-y-1">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="text-xs text-gray-700 dark:text-gray-300 flex justify-between gap-2"
                      >
                        <span className="truncate">{f.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 shrink-0">
                          {formatBytes(f.size)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          {step > 1 && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptic('light')
                setStep((s) => s - 1)
              }}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-sm"
            >
              Назад
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={step === totalSteps ? handleCreate : handleNext}
            disabled={loading || processingFiles}
            className={`flex-1 ${
              step === totalSteps
                ? 'bg-green-500 active:bg-green-600'
                : 'bg-blue-500 active:bg-blue-600'
            } disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm`}
          >
            {loading ? 'Создание...' : step === totalSteps ? 'Создать заказ' : 'Далее'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SummaryRow({ label, value, multiline = false }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>
      <p
        className={`text-sm text-gray-900 dark:text-gray-100 ${
          multiline ? 'whitespace-pre-wrap break-words' : 'truncate'
        }`}
      >
        {value || '—'}
      </p>
    </div>
  )
}

function FilePickerButton({ accept, onPick, icon: Icon, label }) {
  return (
    <label className="cursor-pointer">
      <input
        type="file"
        multiple
        accept={accept}
        onChange={(e) => {
          const arr = Array.from(e.target.files || [])
          e.target.value = ''
          onPick(arr)
        }}
        className="hidden"
      />
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-4 flex flex-col items-center gap-1 text-sm text-gray-600 dark:text-gray-400 active:border-blue-500">
        <Icon size={20} />
        <span>{label}</span>
      </div>
    </label>
  )
}
