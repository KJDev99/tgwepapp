// Утилиты отображения банковской карты

// Последние 4 цифры номера карты
export function cardLast4(card) {
  const raw = card?.card_number ?? ''
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length >= 4) return digits.slice(-4)
  return digits || '••••'
}

// Маска вида "•••• 1234"
export function cardMask(card) {
  return `•••• ${cardLast4(card)}`
}

// Тип/бренд карты (Visa, MasterCard, МИР и т.д.)
export function cardBrand(card) {
  const type = card?.card_type
  if (type && String(type).trim()) return String(type).trim()
  return 'Карта'
}
