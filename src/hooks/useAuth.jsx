import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { telegramAuth, fetchProfile } from '../api/auth'
import { setAccessToken, setUnauthorizedHandler } from '../api/client'
import { getInitData } from '../utils/telegramInitData'

const AuthContext = createContext(null)

const EXECUTOR_GROUP_KEYWORDS = ['executor', 'исполнитель', 'performer', 'ijrochi']
const STUDENT_GROUP_KEYWORDS = ['student', 'студент', 'талаба']

export function deriveRole(user) {
  if (!user?.groups?.length) return null
  const names = user.groups.map((g) => (g.name || '').toLowerCase())
  if (names.some((n) => EXECUTOR_GROUP_KEYWORDS.some((k) => n.includes(k)))) return 'executor'
  if (names.some((n) => STUDENT_GROUP_KEYWORDS.some((k) => n.includes(k)))) return 'student'
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const doLogin = useCallback(async () => {
    const initData = getInitData()
    if (!initData) {
      throw new Error('Telegram initData topilmadi. Botda Mini App orqali oching.')
    }
    const res = await telegramAuth(initData)
    if (res?.access_token) setAccessToken(res.access_token)
    if (res?.user) setUser(res.user)
    setIsNewUser(Boolean(res?.is_new_user))
    return res
  }, [])

  const bootstrap = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await doLogin()
      if (!res?.user && !res?.is_new_user) {
        try {
          const profile = await fetchProfile()
          if (profile) setUser(profile)
        } catch {
          // ignore
        }
      }
    } catch (e) {
      setError(e?.message || 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }, [doLogin])

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      try {
        const res = await doLogin()
        return res?.access_token ?? null
      } catch {
        return null
      }
    })
    bootstrap()
    return () => setUnauthorizedHandler(null)
  }, [bootstrap, doLogin])

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await fetchProfile()
      if (profile) {
        setUser(profile)
        if (profile.groups?.length > 0) setIsNewUser(false)
      }
      return profile
    } catch {
      return null
    }
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setIsNewUser(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      role: deriveRole(user),
      isNewUser,
      loading,
      error,
      retry: bootstrap,
      refreshProfile,
      logout,
      setUser,
      setIsNewUser,
    }),
    [user, isNewUser, loading, error, bootstrap, refreshProfile, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
