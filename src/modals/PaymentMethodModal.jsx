import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiCreditCard, FiPlusCircle, FiCheck, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
  fetchCards,
  payWithSavedCard,
  payWithNewCard,
  extractConfirmationToken,
} from '../api/payment'
import { extractErrorMessage } from '../api/client'
import { haptic } from '../hooks/useTelegram'
import { cardLast4, cardBrand } from '../utils/card'
import YooKassaWidget from '../components/YooKassaWidget'

const NEW_CARD = 'new'

// Оплата заказа (заморозка средств в escrow).
// order: { id, price, title }
export default function PaymentMethodModal({ order, onClose, onPaid }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(NEW_CARD)
  const [paying, setPaying] = useState(false)
  const [widgetToken, setWidgetToken] = useState(null)

  const amount = Number(order?.price) || 0

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchCards()
      .then((list) => {
        if (!mounted) return
        setCards(list)
        if (list.length > 0) setSelected(list[0].id)
      })
      .catch(() => {
        if (mounted) setCards([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const finishPaid = () => {
    haptic('success')
    toast.success('Оплата прошла, средства зарезервированы')
    onPaid?.()
  }

  const handlePay = async () => {
    if (paying) return
    if (!amount) {
      toast.error('У заказа не указана цена')
      haptic('error')
      return
    }
    setPaying(true)
    try {
      let data
      if (selected === NEW_CARD) {
        data = await payWithNewCard({ orderId: order.id })
      } else {
        data = await payWithSavedCard({ cardId: selected, orderId: order.id })
      }
      const token = extractConfirmationToken(data)
      if (token) {
        // нужна доп. аутентификация / ввод данных карты в виджете
        setWidgetToken(token)
      } else {
        // оплата сохранённой картой прошла без виджета
        finishPaid()
      }
    } catch (e) {
      haptic('error')
      toast.error(extractErrorMessage(e, 'Не удалось провести оплату'))
    } finally {
      setPaying(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end"
      onClick={paying ? undefined : onClose}
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
            {widgetToken ? 'Оплата' : 'Способ оплаты'}
          </h1>
          <button
            onClick={onClose}
            className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
            aria-label="Закрыть"
          >
            <FiX size={20} />
          </button>
        </div>

        {widgetToken ? (
          <div className="max-h-[70vh] overflow-y-auto">
            <YooKassaWidget confirmationToken={widgetToken} onSuccess={finishPaid} />
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 mb-4 text-white">
              <p className="text-xs opacity-90 mb-0.5 truncate">{order?.title || 'Заказ'}</p>
              <p className="text-2xl font-bold">{amount.toLocaleString('ru-RU')} ₽</p>
              <div className="flex items-center gap-1 mt-2 text-[11px] opacity-90">
                <FiLock size={11} />
                <span>Деньги замораживаются до подтверждения работы</span>
              </div>
            </div>

            <div className="max-h-[40vh] overflow-y-auto space-y-2 mb-4">
              {loading ? (
                <div className="flex justify-center py-5">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {cards.map((card) => (
                    <PayOption
                      key={card.id}
                      active={selected === card.id}
                      onClick={() => {
                        haptic('selection')
                        setSelected(card.id)
                      }}
                      icon={<FiCreditCard size={20} className="text-gray-400" />}
                      title={`•••• ${cardLast4(card)}`}
                      subtitle={cardBrand(card)}
                    />
                  ))}
                  <PayOption
                    active={selected === NEW_CARD}
                    onClick={() => {
                      haptic('selection')
                      setSelected(NEW_CARD)
                    }}
                    icon={<FiPlusCircle size={20} className="text-blue-500" />}
                    title="Новой картой"
                    subtitle="Разовый платёж, карта не сохраняется"
                  />
                </>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePay}
              disabled={paying || loading}
              className="w-full bg-green-500 active:bg-green-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2"
            >
              {paying ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiLock size={16} />
                  Оплатить {amount.toLocaleString('ru-RU')} ₽
                </>
              )}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function PayOption({ active, onClick, icon, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 border-2 transition-colors text-left ${
        active
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-transparent bg-gray-50 dark:bg-gray-700/40'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tabular-nums">{title}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
      </div>
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          active ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {active && <FiCheck size={12} />}
      </span>
    </button>
  )
}
