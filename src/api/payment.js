import { api } from './client'
import { ENDPOINTS } from './endpoints'

// --- helpers --------------------------------------------------------------

function unwrapList(data) {
  if (Array.isArray(data)) {
    return { items: data, count: data.length, next: null, previous: null }
  }
  return {
    items: data?.results ?? [],
    count: data?.count ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  }
}

// YooKassa confirmation token может прийти в разных формах в зависимости
// от эндпоинта (cards -> верхний уровень, new-card-payment -> внутри confirmation)
export function extractConfirmationToken(data) {
  return (
    data?.confirmation_token ||
    data?.confirmation?.confirmation_token ||
    data?.confirmation?.confirmationToken ||
    null
  )
}

export function extractPaymentId(data) {
  return data?.payment_id || data?.confirmation?.payment_id || data?.id || null
}

// --- cards ----------------------------------------------------------------

export async function fetchCards() {
  const { data } = await api.get(ENDPOINTS.paymentCards)
  return unwrapList(data).items
}

// Создаёт привязку карты. Возвращает { payment_id, confirmation_token }
export async function addCard() {
  const { data } = await api.post(ENDPOINTS.paymentCards, {})
  return data
}

// Подтверждение привязки карты после прохождения виджета
export async function confirmCard(paymentId) {
  const { data } = await api.post(ENDPOINTS.paymentConfirmCard, {
    payment_id: paymentId,
  })
  return data
}

export async function fetchCardDetail(cardId) {
  const { data } = await api.get(ENDPOINTS.paymentCardDetail(cardId))
  return data
}

export async function deleteCard(cardId) {
  await api.delete(ENDPOINTS.paymentCardDetail(cardId))
}

// --- order payment (escrow hold) -----------------------------------------

// Оплата сохранённой картой. Может вернуть confirmation_token (3-D Secure)
// либо сразу успешный ответ.
export async function payWithSavedCard({ cardId, orderId }) {
  const { data } = await api.post(ENDPOINTS.paymentCardPayment, {
    card_id: Number(cardId),
    order_id: Number(orderId),
  })
  return data
}

// Разовая оплата новой картой (карта не сохраняется). Возвращает confirmation_token.
export async function payWithNewCard({ orderId }) {
  const { data } = await api.post(ENDPOINTS.paymentNewCardPayment, {
    order_id: Number(orderId),
  })
  return data
}

// Подтверждение оплаты (capture) — деньги уходят исполнителю
export async function confirmPayment(orderId, amount) {
  const body = {}
  if (amount !== undefined && amount !== null && amount !== '') {
    body.amount = Number(amount)
  }
  const { data } = await api.post(ENDPOINTS.paymentConfirmPayment(orderId), body)
  return data
}

// Отмена оплаты (возврат замороженных средств)
export async function cancelPayment(orderId, paymentId) {
  const body = {}
  if (paymentId) body.payment_id = paymentId
  const { data } = await api.post(ENDPOINTS.paymentCancelPayment(orderId), body)
  return data
}

// --- payout (withdraw) ----------------------------------------------------

export async function createPayout({ cardId, amount }) {
  const { data } = await api.post(ENDPOINTS.paymentPayout, {
    card_id: Number(cardId),
    amount: String(amount),
  })
  return data
}

export async function fetchPayouts({ page = 1, limit = 20 } = {}) {
  const { data } = await api.get(ENDPOINTS.paymentAllPayout, {
    params: { page, limit },
  })
  return unwrapList(data)
}
