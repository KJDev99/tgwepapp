export const API_BASE = 'https://dev2.time-to-skill.ru/api'
export const WS_BASE = 'wss://dev2.time-to-skill.ru/ws'

let cachedMediaHost = null
function getMediaHost() {
  if (cachedMediaHost) return cachedMediaHost
  try {
    const u = new URL(API_BASE)
    cachedMediaHost = `${u.protocol}//${u.host}`
  } catch {
    cachedMediaHost = ''
  }
  return cachedMediaHost
}

export function absoluteMediaUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  )
    return url
  const host = getMediaHost()
  if (!host) return url
  return url.startsWith('/') ? host + url : host + '/' + url
}

export const ENDPOINTS = {
  // Auth
  telegramAuth: '/auth/telegram-auth/',
  profile: '/auth/profile/',
  groups: '/auth/groups/',
  groupsChange: '/auth/groups-change/',
  tagSkills: '/auth/tag-skills/',
  reviews: '/auth/reviews/',
  userDetail: (userId) => `/auth/detail/${userId}/`,

  // Chat
  chatRooms: '/chat/rooms/',
  chatRoomOpen: '/chat/rooms/open/',
  chatMessages: (roomId) => `/chat/rooms/${roomId}/messages/`,

  // Orders - Meta
  typeOrders: '/orders/type-orders/',

  // Orders - Student
  ordersStudent: '/orders/student/',
  orderDetailStudent: (id) => `/orders/detail/${id}/student/`,
  orderSuggestedExecutors: (id) => `/orders/detail/${id}/student/suggested-executors/`,
  orderAddExecutor: (id) => `/orders/detail/${id}/executor/`,

  // Orders - Executor
  ordersExecutor: '/orders/executor/',
  ordersAllExecutors: '/orders/all-executors/',
  inviteResponse: '/orders/invite-response/',
  orderDetailExecutors: (id) => `/orders/detail/${id}/executor/`,
  orderProgress: (id) => `/orders/${id}/progress/`,
  orderComplete: (id) => `/orders/${id}/complete/`,
  orderReview: (id) => `/orders/${id}/review/`,
}

export const wsChat = (roomId, token) =>
  `${WS_BASE}/chat/${roomId}/?token=${encodeURIComponent(token)}`
