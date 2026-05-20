function getDevInitData() {
  if (!import.meta.env.DEV) return null
  const fromEnv = import.meta.env.VITE_DEV_INIT_DATA
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv
  return null
}

export function getInitData() {
  if (typeof window === 'undefined') return null
  const tgInit = window.Telegram?.WebApp?.initData
  if (tgInit && tgInit.length > 0) return tgInit
  return getDevInitData()
}

export function isRunningInTelegram() {
  if (typeof window === 'undefined') return false
  return Boolean(window.Telegram?.WebApp?.initData)
}

export function parseTelegramUser() {
  try {
    const initData = getInitData()
    if (!initData) return null
    const params = new URLSearchParams(initData)
    const userStr = params.get('user')
    if (!userStr) return null
    return JSON.parse(userStr)
  } catch {
    return null
  }
}
