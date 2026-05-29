import { api } from './client'
import { ENDPOINTS } from './endpoints'

function unwrapList(data) {
  if (Array.isArray(data)) return { items: data, count: data.length, next: null }
  return {
    items: data?.results ?? [],
    count: data?.count ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  }
}

export async function fetchStudentOrders({ page = 1, limit = 20 } = {}) {
  const { data } = await api.get(ENDPOINTS.ordersStudent, { params: { page, limit } })
  return unwrapList(data)
}

export async function fetchExecutorOrders({ page = 1, limit = 20 } = {}) {
  const { data } = await api.get(ENDPOINTS.ordersExecutor, { params: { page, limit } })
  const result = unwrapList(data)
  result.items = result.items.map((entry) => {
    if (entry && entry.order && typeof entry.order === 'object') {
      return {
        ...entry.order,
        assignment_id: entry.id,
        executor_id: entry.executor,
      }
    }
    return entry
  })
  return result
}

export async function fetchOrderTypes() {
  const { data } = await api.get(ENDPOINTS.typeOrders)
  if (Array.isArray(data)) return data
  return data?.results ?? []
}

function buildOrderFormData(payload) {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === 'files' && Array.isArray(value)) {
      value.forEach((file) => fd.append('files', file))
      return
    }
    if (Array.isArray(value)) {
      const hasObjects = value.some((v) => v && typeof v === 'object')
      if (hasObjects) {
        fd.append(key, JSON.stringify(value))
        return
      }
      value.forEach((v) => fd.append(key, v))
      return
    }
    fd.append(key, value)
  })
  return fd
}

export async function createOrder(payload) {
  const hasFiles = Array.isArray(payload.files) && payload.files.length > 0
  if (hasFiles) {
    const fd = buildOrderFormData(payload)
    const { data } = await api.post(ENDPOINTS.ordersStudent, fd)
    return data
  }
  const { data } = await api.post(ENDPOINTS.ordersStudent, payload)
  return data
}

export async function fetchOrderDetail(orderId) {
  const { data } = await api.get(ENDPOINTS.orderDetailStudent(orderId))
  return data
}

export async function updateOrder(orderId, payload) {
  const { data } = await api.put(ENDPOINTS.orderDetailStudent(orderId), payload)
  return data
}

export async function deleteOrder(orderId) {
  await api.delete(ENDPOINTS.orderDetailStudent(orderId))
}

export async function fetchSuggestedExecutors(orderId) {
  const { data } = await api.get(ENDPOINTS.orderSuggestedExecutors(orderId))
  if (Array.isArray(data)) return data
  return data?.executors ?? data?.results ?? data?.items ?? []
}

export async function fetchOrderExecutors(orderId) {
  const { data } = await api.get(ENDPOINTS.orderAddExecutor(orderId))
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function addOrderExecutor(orderId, executorId) {
  const { data } = await api.post(ENDPOINTS.orderAddExecutor(orderId), { executor: executorId })
  return data
}

export async function updateOrderProgress(orderId, payload) {
  const { data } = await api.patch(ENDPOINTS.orderProgress(orderId), payload)
  return data
}

export async function completeOrder(orderId, payload = {}) {
  const { data } = await api.patch(ENDPOINTS.orderComplete(orderId), payload)
  return data
}

export async function createOrderReview(orderId, payload) {
  const { data } = await api.post(ENDPOINTS.orderReview(orderId), payload)
  return data
}

export async function fetchAllExecutorsOrders({ page = 1, limit = 20, type_order = '', price = '' } = {}) {
  const params = { page, limit }
  if (type_order) params.type_order = type_order
  if (price) params.price = price
  const { data } = await api.get(ENDPOINTS.ordersAllExecutors, { params })
  return unwrapList(data)
}
