import { useEffect, useState, useCallback } from 'react'
import { parseTelegramUser } from '../utils/telegramInitData'

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null

export function useTelegram() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!tg) return
    tg.ready()
    tg.expand()
    if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes()
    setIsReady(true)
  }, [])

  const tgUser = tg?.initDataUnsafe?.user ?? parseTelegramUser()

  return {
    tg,
    isReady,
    user: tgUser,
    photoUrl: tgUser?.photo_url ?? null,
    colorScheme: tg?.colorScheme ?? 'dark',
    themeParams: tg?.themeParams ?? {},
    platform: tg?.platform ?? 'unknown',
  }
}

export function useTelegramPhoto() {
  const tgUser = tg?.initDataUnsafe?.user ?? parseTelegramUser()
  return tgUser?.photo_url ?? null
}

export function useTelegramTheme(setIsDark) {
  useEffect(() => {
    if (!tg) return
    setIsDark(tg.colorScheme === 'dark')
    const handler = () => setIsDark(tg.colorScheme === 'dark')
    tg.onEvent?.('themeChanged', handler)
    return () => tg.offEvent?.('themeChanged', handler)
  }, [setIsDark])
}

export function useBackButton(visible, onClick) {
  useEffect(() => {
    if (!tg?.BackButton) return
    if (visible) {
      tg.BackButton.show()
      tg.BackButton.onClick(onClick)
    } else {
      tg.BackButton.hide()
    }
    return () => {
      tg.BackButton.offClick(onClick)
    }
  }, [visible, onClick])
}

export function useMainButton({ text, visible, onClick, loading, disabled }) {
  useEffect(() => {
    if (!tg?.MainButton) return
    const btn = tg.MainButton
    if (!visible) {
      btn.hide()
      return
    }
    btn.setText(text)
    if (disabled) btn.disable()
    else btn.enable()
    if (loading) btn.showProgress?.()
    else btn.hideProgress?.()
    btn.show()
    btn.onClick(onClick)
    return () => btn.offClick(onClick)
  }, [text, visible, onClick, loading, disabled])
}

export function openLink(url) {
  if (!url) return false
  try {
    if (tg?.openLink) {
      tg.openLink(url, { try_instant_view: false })
      return true
    }
  } catch {
    // fallthrough to window.open
  }
  try {
    window.open(url, '_blank', 'noopener,noreferrer')
    return true
  } catch {
    return false
  }
}

export function closeWebApp() {
  if (tg?.close) {
    try {
      tg.close()
      return true
    } catch {
      // ignore
    }
  }
  return false
}

// Добавление иконки приложения на главный экран телефона (Bot API 8.0+)
export function canAddToHomeScreen() {
  return typeof tg?.addToHomeScreen === 'function'
}

export function addToHomeScreen() {
  if (typeof tg?.addToHomeScreen === 'function') {
    try {
      tg.addToHomeScreen()
      return true
    } catch {
      // ignore
    }
  }
  return false
}

export function haptic(type = 'light') {
  const hf = tg?.HapticFeedback
  if (!hf) return
  if (type === 'success' || type === 'error' || type === 'warning') {
    hf.notificationOccurred(type)
  } else if (type === 'selection') {
    hf.selectionChanged()
  } else {
    hf.impactOccurred(type)
  }
}
