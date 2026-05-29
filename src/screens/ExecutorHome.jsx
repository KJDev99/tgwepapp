import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLogOut, FiRefreshCw, FiChevronLeft, FiChevronRight, FiClock, FiDollarSign, FiSearch, FiX } from 'react-icons/fi'
import { SkeletonCard } from '../components/Skeleton'
import Avatar from '../components/Avatar'
import { fetchAllExecutorsOrders, fetchOrderTypes } from '../api/orders'
import { getStatusInfo } from '../constants/orderStatus'
import { useTelegramPhoto } from '../hooks/useTelegram'

export default function ExecutorHome({ user, onLogout, onOpenOrder, refreshKey }) {
  const [orders, setOrders] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [typeOrder, setTypeOrder] = useState('')
  const [localPrice, setLocalPrice] = useState('')
  const [price, setPrice] = useState('')
  const [orderTypes, setOrderTypes] = useState([])
  const [localRefresh, setLocalRefresh] = useState(0)

  const displayName = user?.full_name || user?.username || 'друг'
  const tgPhotoUrl = useTelegramPhoto()
  const photoUrl = user?.avatar_url || tgPhotoUrl

  // Fetch order types on mount
  useEffect(() => {
    fetchOrderTypes()
      .then(setOrderTypes)
      .catch(() => {})
  }, [])

  // Debounce price input
  useEffect(() => {
    const t = setTimeout(() => {
      setPrice(localPrice)
      setPage(1)
    }, 450)
    return () => clearTimeout(t)
  }, [localPrice])

  // Load available orders
  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAllExecutorsOrders({
        page,
        limit,
        type_order: typeOrder,
        price,
      })
      setOrders(res.items)
      setCount(res.count)
    } catch (err) {
      setError(err)
      setOrders([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, limit, typeOrder, price, refreshKey, localRefresh])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleRefresh = () => {
    setLocalRefresh((k) => k + 1)
  }

  const handleClearFilters = () => {
    setTypeOrder('')
    setLocalPrice('')
    setPrice('')
    setPage(1)
  }

  const totalPages = Math.ceil(count / limit)

  return (
    <div className="min-h-screen px-4 pt-4 pb-28 safe-area">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 mb-5"
      >
        <div className="flex items-center min-w-0 gap-3">
          <Avatar name={displayName} photoUrl={photoUrl} size={40} />
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">Привет, {displayName}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Биржа заказов</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleRefresh}
            className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800"
            aria-label="Обновить"
          >
            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onLogout}
            className="p-2 text-red-600 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300"
            aria-label="Выйти"
          >
            <FiLogOut size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Filters Section */}
      <div className="mb-5 space-y-3">
        {/* Price Input and Clear Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiDollarSign size={15} />
            </span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Фильтр по цене (₽)..."
              value={localPrice}
              onChange={(e) => setLocalPrice(e.target.value)}
              className="w-full pl-8 pr-8 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {localPrice && (
              <button
                onClick={() => setLocalPrice('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <FiX size={15} />
              </button>
            )}
          </div>
          {(typeOrder || price) && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClearFilters}
              className="px-3 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold"
            >
              Сброс
            </motion.button>
          )}
        </div>

        {/* Order Type Badges */}
        {orderTypes.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            <button
              onClick={() => {
                setTypeOrder('')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                typeOrder === ''
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              Все
            </button>
            {orderTypes.map((type) => {
              const active = typeOrder === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setTypeOrder(type.id)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {type.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : error ? (
        <div className="py-10 text-sm text-center text-red-500 dark:text-red-400">
          Не удалось загрузить заказы
        </div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-sm text-center text-gray-400">
          Нет доступных заказов
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => {
            const info = getStatusInfo(1, order.status)
            const typeName = order.type_order?.name || order.type_order || '—'
            const formattedPrice = order.price ? `${Number(order.price).toLocaleString('ru-RU')} ₽` : '—'

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onOpenOrder?.(order)}
                className="p-4 bg-white border border-gray-200 shadow-sm cursor-pointer dark:bg-gray-800 rounded-xl dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-900 transition-colors"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {order.title || `Заказ #${order.id}`}
                  </h3>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    {formattedPrice}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                    {typeName}
                  </span>
                  {order.user && (
                    <span className="text-[10px] text-gray-400 truncate">
                      от {order.user}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  {order.deadline ? (
                    <span className="flex items-center gap-1">
                      <FiClock size={12} />
                      До {new Date(order.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  ) : (
                    <span />
                  )}
                  {order.items?.length > 0 && (
                    <span className="truncate max-w-[50%] text-right font-medium">
                      {order.items[0]?.title || order.items[0]}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
            aria-label="Предыдущая страница"
          >
            <FiChevronLeft size={16} />
          </motion.button>
          <span className="text-xs font-medium">
            {page} из {totalPages}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40"
            aria-label="Следующая страница"
          >
            <FiChevronRight size={16} />
          </motion.button>
        </div>
      )}
    </div>
  )
}
