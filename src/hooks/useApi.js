import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export function useApi(method, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api[method]()
      setData(result.data ?? result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, ...deps])

  useEffect(() => { reload() }, [reload])

  return { data, loading, error, reload }
}
