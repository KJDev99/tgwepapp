import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'tgwepapp:theme'

function readInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light') return false
    if (saved === 'dark') return true
  } catch {
    // localStorage blocked
  }
  return true
}

export function useTheme() {
  const [isDark, setIsDark] = useState(readInitial)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    root.classList.toggle('dark', isDark)
    body.classList.toggle('dark', isDark)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', isDark ? '#0f172a' : '#f8fafc')
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [isDark])

  const toggle = useCallback(() => setIsDark((v) => !v), [])

  return { isDark, toggle, setIsDark }
}
