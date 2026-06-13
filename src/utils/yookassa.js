// Динамическая загрузка виджета оплаты YooKassa.
// Скрипт грузится один раз и переиспользуется.

const WIDGET_SRC = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'

let loadPromise = null

export function loadYooKassaWidget() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window недоступен'))
  }
  if (window.YooMoneyCheckoutWidget) {
    return Promise.resolve(window.YooMoneyCheckoutWidget)
  }
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.YooMoneyCheckoutWidget) resolve(window.YooMoneyCheckoutWidget)
      else reject(new Error('Виджет YooKassa недоступен'))
    }

    const existing = document.querySelector(`script[src="${WIDGET_SRC}"]`)
    if (existing) {
      if (window.YooMoneyCheckoutWidget) {
        resolve(window.YooMoneyCheckoutWidget)
      } else {
        existing.addEventListener('load', finish)
        existing.addEventListener('error', () => {
          loadPromise = null
          reject(new Error('Не удалось загрузить виджет YooKassa'))
        })
      }
      return
    }

    const script = document.createElement('script')
    script.src = WIDGET_SRC
    script.async = true
    script.onload = finish
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Не удалось загрузить виджет YooKassa'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
