export const API_BASE = 'https://dev2.time-to-skill.ru/api'
export const WS_BASE = 'wss://dev2.time-to-skill.ru/ws'

export const ENDPOINTS = {
  // Auth
  telegramAuth: '/auth/telegram-auth/',
  profile: '/auth/profile/',
  groups: '/auth/groups/',
  tagSkills: '/auth/tag-skills/',
  reviews: '/auth/reviews/',
  userDetail: (userId) => `/auth/detail/${userId}/`,

  // Chat
  chatRooms: '/chat/rooms/',
  chatRoomOpen: '/chat/rooms/open/',
  chatMessages: (roomId) => `/chat/rooms/${roomId}/messages/`,

  // Orders - Student
  ordersStudent: '/orders/student/',
  orderDetailStudent: (id) => `/orders/detail/${id}/student/`,
  orderSuggestedExecutors: (id) => `/orders/detail/${id}/student/suggested-executors/`,
  orderAddExecutor: (id) => `/orders/detail/${id}/executor/`,

  // Orders - Executor
  ordersExecutor: '/orders/executor/',
  orderProgress: (id) => `/orders/${id}/progress/`,
  orderComplete: (id) => `/orders/${id}/complete/`,
  orderReview: (id) => `/orders/${id}/review/`,
}

export const wsChat = (roomId, token) =>
  `${WS_BASE}/chat/${roomId}/?token=${encodeURIComponent(token)}`
