import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiX,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiPaperclip,
  FiStar,
  FiUserPlus,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
  fetchOrderDetail,
  fetchSuggestedExecutors,
  addOrderExecutor,
  updateOrder,
  deleteOrder,
} from '../api/orders'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'
import { getStatusInfo } from '../constants/orderStatus'
import Avatar from '../components/Avatar'

const MAX_ITEMS = 10

function isEditable(order) {
  if (!order) return false
  const status = order.status
  if (typeof status === 'number') return status <= 1
  if (typeof status === 'string') {
    const lower = status.toLowerCase()
    return lower === 'новый' || lower === 'создан'
  }
  return false
}

export default function OrderDetailModal({ orderId, onClose, onChanged }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [executors, setExecutors] = useState([])
  const [executorsLoading, setExecutorsLoading] = useState(false)
  const [assigningId, setAssigningId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [editTitle, setEditTitle] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editItems, setEditItems] = useState([''])

  useEffect(() => {
    if (!orderId) return
    let mounted = true
    setLoading(true)
    fetchOrderDetail(orderId)
      .then((data) => {
        if (!mounted) return
        setOrder(data)
      })
      .catch((e) => {
        if (!mounted) return
        toast.error(extractErrorMessage(e, 'Не удалось загрузить заказ'))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [orderId])

  useEffect(() => {
    if (!order || !isEditable(order)) {
      setExecutors([])
      return
    }
    let mounted = true
    setExecutorsLoading(true)
    fetchSuggestedExecutors(order.id)
      .then((list) => {
        if (mounted) setExecutors(list)
      })
      .catch(() => {
        if (mounted) setExecutors([])
      })
      .finally(() => {
        if (mounted) setExecutorsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [order])

  const beginEdit = () => {
    if (!order) return
    haptic('selection')
    setEditTitle(order.title || '')
    setEditDeadline(order.deadline ? order.deadline.slice(0, 10) : '')
    setEditDescription(order.description || '')
    setEditPrice(order.price ? String(order.price) : '')
    const list = (order.items || []).map((it) => it.title || '')
    setEditItems(list.length > 0 ? list : [''])
    setEditMode(true)
  }

  const cancelEdit = () => {
    haptic('light')
    setEditMode(false)
  }

  const updateEditItem = (idx, val) => {
    setEditItems((prev) => prev.map((s, i) => (i === idx ? val : s)))
  }

  const addEditItem = () => {
    if (editItems.length >= MAX_ITEMS) return
    const last = editItems[editItems.length - 1]
    if (!last || !last.trim()) {
      toast.error('Сначала заполните предыдущий пункт')
      haptic('error')
      return
    }
    haptic('light')
    setEditItems((prev) => [...prev, ''])
  }

  const removeEditItem = (idx) => {
    if (editItems.length <= 1) return
    haptic('selection')
    setEditItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    if (saving) return
    if (!editTitle.trim()) {
      toast.error('Введите тему')
      haptic('error')
      return
    }
    setSaving(true)
    try {
      const filled = editItems.map((s) => s.trim()).filter(Boolean)
      const payload = {
        title: editTitle.trim(),
        items: filled.map((title) => ({ title })),
      }
      if (editDeadline) payload.deadline = new Date(editDeadline).toISOString()
      payload.description = editDescription.trim()
      payload.price = editPrice.trim() || null
      const updated = await updateOrder(order.id, payload)
      haptic('success')
      toast.success('Заказ обновлён')
      setOrder(updated)
      setEditMode(false)
      onChanged?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось обновить'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await deleteOrder(order.id)
      haptic('success')
      toast.success('Заказ удалён')
      onChanged?.()
      onClose?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось удалить'))
    } finally {
      setDeleting(false)
    }
  }

  const handleAssign = async (executorId) => {
    if (assigningId) return
    setAssigningId(executorId)
    try {
      await addOrderExecutor(order.id, executorId)
      haptic('success')
      toast.success('Исполнитель назначен')
      const updated = await fetchOrderDetail(order.id)
      setOrder(updated)
      onChanged?.()
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось назначить'))
    } finally {
      setAssigningId(null)
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold">
            {editMode ? 'Редактировать' : 'Заказ'}
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

        <div className="max-h-[65vh] overflow-y-auto pb-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !order ? (
            <p className="text-sm text-gray-500 text-center py-6">Заказ не найден</p>
          ) : editMode ? (
            <EditForm
              title={editTitle}
              setTitle={setEditTitle}
              deadline={editDeadline}
              setDeadline={setEditDeadline}
              description={editDescription}
              setDescription={setEditDescription}
              price={editPrice}
              setPrice={setEditPrice}
              items={editItems}
              updateItem={updateEditItem}
              addItem={addEditItem}
              removeItem={removeEditItem}
            />
          ) : (
            <DetailView
              order={order}
              executors={executors}
              executorsLoading={executorsLoading}
              assigningId={assigningId}
              onAssign={handleAssign}
            />
          )}
        </div>

        {!loading && order && !editMode && (
          <div className="flex gap-2 mt-4">
            {isEditable(order) && (
              <>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={beginEdit}
                  className="flex-1 bg-blue-500 active:bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
                >
                  <FiEdit2 size={15} /> Изменить
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    haptic('warning')
                    setConfirmDelete(true)
                  }}
                  className="flex-1 bg-red-500 active:bg-red-600 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5"
                >
                  <FiTrash2 size={15} /> Удалить
                </motion.button>
              </>
            )}
            {!isEditable(order) && (
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-sm"
              >
                Закрыть
              </button>
            )}
          </div>
        )}

        {!loading && order && editMode && (
          <div className="flex gap-2 mt-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={cancelEdit}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-sm"
            >
              Отмена
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-500 active:bg-green-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </motion.button>
          </div>
        )}

        {confirmDelete && (
          <div
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 w-full max-w-xs"
            >
              <h3 className="font-semibold text-base mb-2">Удалить заказ?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Это действие нельзя отменить.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 active:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold"
                >
                  {deleting ? '...' : 'Удалить'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function DetailView({ order, executors, executorsLoading, assigningId, onAssign }) {
  const info = getStatusInfo(
    typeof order.status === 'number' ? order.status : undefined,
    typeof order.status === 'string' ? order.status : order.status_label
  )
  const editable = isEditable(order)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold flex-1 break-words">{order.title}</h2>
        <span className={`text-[10px] px-2 py-1 rounded shrink-0 ${info.tone}`}>
          {info.label}
        </span>
      </div>

      <Row label="Тип" value={order.type_order?.name || '—'} />
      <Row
        label="Срок"
        value={order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : '—'}
      />
      <Row label="Цена" value={order.price ? `${order.price} ₽` : '—'} />
      <Row label="Описание" value={order.description || '—'} multiline />

      <div>
        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
          Предметы ({order.items?.length || 0})
        </p>
        {order.items && order.items.length > 0 ? (
          <ul className="space-y-1">
            {order.items.map((it) => (
              <li
                key={it.id}
                className="text-sm bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2"
              >
                {it.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">—</p>
        )}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
          Файлы ({order.files?.length || 0})
        </p>
        {order.files && order.files.length > 0 ? (
          <ul className="space-y-1">
            {order.files.map((f) => {
              const name = decodeURIComponent(
                (f.order_file || '').split('/').pop() || 'файл'
              )
              return (
                <li
                  key={f.id}
                  className="text-xs bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <FiPaperclip size={14} className="shrink-0 text-gray-400" />
                  <a
                    href={f.order_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 truncate flex-1"
                  >
                    {name}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm">—</p>
        )}
      </div>

      {editable && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5 mt-1">
            Рекомендуемые исполнители
          </p>
          {executorsLoading ? (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : executors.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              Нет рекомендаций
            </p>
          ) : (
            <div className="space-y-2">
              {executors.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-2.5 flex items-center gap-2"
                >
                  <Avatar name={ex.name} photoUrl={ex.avatar_url} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{ex.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      {ex.rating != null && (
                        <span className="flex items-center gap-0.5">
                          <FiStar size={11} className="text-yellow-500" />
                          {ex.rating}
                        </span>
                      )}
                      {ex.speciality && <span className="truncate">{ex.speciality}</span>}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAssign(ex.id)}
                    disabled={assigningId !== null}
                    className="bg-blue-500 active:bg-blue-600 disabled:opacity-50 text-white p-2 rounded-lg shrink-0"
                    aria-label="Назначить"
                  >
                    {assigningId === ex.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiUserPlus size={16} />
                    )}
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EditForm({
  title,
  setTitle,
  deadline,
  setDeadline,
  description,
  setDescription,
  price,
  setPrice,
  items,
  updateItem,
  addItem,
  removeItem,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Тема</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-20 resize-none text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Срок</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Цена</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="5000"
          inputMode="decimal"
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 min-h-20 resize-none text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Предметы</label>
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
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  aria-label="Удалить"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {items.length < MAX_ITEMS && (
          <button
            type="button"
            onClick={addItem}
            className="mt-2 w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1 active:border-blue-500"
          >
            <FiPlus size={16} />
            Добавить предмет
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, multiline = false }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>
      <p
        className={`text-sm text-gray-900 dark:text-gray-100 ${
          multiline ? 'whitespace-pre-wrap break-words' : 'break-words'
        }`}
      >
        {value || '—'}
      </p>
    </div>
  )
}

