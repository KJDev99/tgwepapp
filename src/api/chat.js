import { api } from './client'
import { ENDPOINTS } from './endpoints'

export async function fetchChatRooms() {
  const { data } = await api.get(ENDPOINTS.chatRooms)
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function openChatRoom(otherUserId) {
  const { data } = await api.post(ENDPOINTS.chatRoomOpen, { other_user_id: otherUserId })
  return data
}

export async function fetchMessages(roomId) {
  const { data } = await api.get(ENDPOINTS.chatMessages(roomId))
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function sendMessageRest(roomId, { text, files = [] }) {
  if (files.length === 0) {
    const { data } = await api.post(ENDPOINTS.chatMessages(roomId), { text: text ?? '' })
    return data
  }
  const fd = new FormData()
  if (text) fd.append('text', text)
  files.forEach((f) => fd.append('files', f))
  const { data } = await api.post(ENDPOINTS.chatMessages(roomId), fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      const comma = String(result).indexOf(',')
      resolve(comma >= 0 ? String(result).slice(comma + 1) : String(result))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
