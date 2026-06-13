import { api } from './client'
import { ENDPOINTS } from './endpoints'

function unwrapList(data) {
  if (Array.isArray(data)) return data
  return data?.results ?? data?.items ?? []
}

export async function fetchNotifications() {
  const { data } = await api.get(ENDPOINTS.notifications)
  return unwrapList(data)
}

export async function fetchNotification(id) {
  const { data } = await api.get(ENDPOINTS.notificationDetail(id))
  return data
}

// Отметить одно уведомление прочитанным
export async function markNotificationRead(id) {
  const { data } = await api.post(ENDPOINTS.notificationDetail(id))
  return data
}

// Отметить все уведомления прочитанными
export async function markAllNotificationsRead() {
  const { data } = await api.post(ENDPOINTS.notificationsReadAll)
  return data
}

export async function deleteNotification(id) {
  await api.delete(ENDPOINTS.notificationDetail(id))
}
