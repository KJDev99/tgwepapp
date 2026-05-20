const DEV_MOCK_INIT_DATA =
  'query_id=AAGSCa9nAAAAAJIJr2dGolhV&user=%7B%22id%22%3A1739524498%2C%22first_name%22%3A%22Jamshid%22%2C%22last_name%22%3A%22Qayimov%22%2C%22language_code%22%3A%22uz%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2Fr_Jjb16hNn1JZzJ34a6WQhvoWJc4oEoFaqT9pij3nyw.svg%22%7D&auth_date=1779299624&signature=fGig_jct1cXmZoNFyqJu37N5mk3r5Yb1TyOrRZSv2u7ylPk2ZUoC1AkBvU7nq1XVJU4L_J2FMzS5RhzU5pa3AQ&hash=7af9515f4cd9761651075d7f82f010669273df402b844ed013f65971bdca07b5'

export function getInitData() {
  if (typeof window === 'undefined') return null
  const tgInit = window.Telegram?.WebApp?.initData
  if (tgInit && tgInit.length > 0) return tgInit
  if (import.meta.env.DEV) return DEV_MOCK_INIT_DATA
  return null
}

export function isRunningInTelegram() {
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
