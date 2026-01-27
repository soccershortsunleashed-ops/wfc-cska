'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestUpdateStandings() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const updateStandings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/standings/update', {
        method: 'POST',
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Обновление турнирной таблицы</h1>
      
      <Button onClick={updateStandings} disabled={loading}>
        {loading ? 'Обновление...' : 'Обновить таблицу'}
      </Button>

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
