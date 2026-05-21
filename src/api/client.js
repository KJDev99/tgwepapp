import axios from 'axios'
import { API_BASE } from './endpoints'

let accessToken = null
let onUnauthorized = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status
    if (status === 401 && onUnauthorized) {
      try {
        const newToken = await onUnauthorized()
        if (newToken && error.config && !error.config._retried) {
          error.config._retried = true
          error.config.headers.Authorization = `Bearer ${newToken}`
          return api.request(error.config)
        }
      } catch {
        // re-auth failed, fallthrough
      }
    }
    return Promise.reject(error)
  }
)

export function extractErrorMessage(error, fallback = 'Произошла ошибка') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (data.message) return data.message
  if (data.error) return data.error
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const val = data[firstKey]
    if (Array.isArray(val)) return `${firstKey}: ${val[0]}`
    if (typeof val === 'string') return `${firstKey}: ${val}`
  }
  return fallback
}
