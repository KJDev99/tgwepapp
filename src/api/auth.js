import { api } from './client'
import { ENDPOINTS } from './endpoints'

export async function telegramAuth(initData) {
  const { data } = await api.post(ENDPOINTS.telegramAuth, { initData })
  return data
}

export async function fetchProfile() {
  const { data } = await api.get(ENDPOINTS.profile)
  if (Array.isArray(data)) return data[0] ?? null
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put(ENDPOINTS.profile, payload)
  return data
}

export async function updateSkills(skillIds) {
  const { data } = await api.patch(ENDPOINTS.profile, { skills: skillIds })
  return data
}

export async function fetchGroups() {
  const { data } = await api.get(ENDPOINTS.groups)
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function fetchTagSkills() {
  const { data } = await api.get(ENDPOINTS.tagSkills)
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function fetchUserDetail(userId) {
  const { data } = await api.get(ENDPOINTS.userDetail(userId))
  return data
}

export async function fetchReviews({ page = 1, limit = 20 } = {}) {
  const { data } = await api.get(ENDPOINTS.reviews, { params: { page, limit } })
  return data
}

export async function changeGroup(groupId) {
  const { data } = await api.put(ENDPOINTS.groupsChange, {
    group: groupId,
    group_id: groupId,
    groups: [groupId],
  })
  return data
}
