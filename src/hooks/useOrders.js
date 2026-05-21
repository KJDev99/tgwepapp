import { useCallback, useEffect, useState } from 'react'
import { fetchStudentOrders, fetchExecutorOrders } from '../api/orders'

export function useStudentOrders(refreshKey = 0) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { items } = await fetchStudentOrders()
      setOrders(items)
    } catch (e) {
      setError(e)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return { orders, loading, error, reload: load }
}

export function useExecutorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { items } = await fetchExecutorOrders()
      setOrders(items)
    } catch (e) {
      setError(e)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { orders, loading, error, reload: load }
}
