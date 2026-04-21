import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import StageBadge from '../components/StageBadge'
import api from '../api/axios'

export default function Fields() {
  const navigate = useNavigate()
  const [fields, setFields] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchFields() {
    try {
      const { data } = await api.get('/fields')
      setFields(data.data)
    } catch {
      setError('Failed to load fields.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFields() }, [])

  async function handleDelete(id) {
    if (!window.confirm('Delete this field?')) return
    try {
      await api.delete(`/fields/${id}`)
      setFields((prev) => prev.filter((f) => f.id !== id))
    } catch {
      setError('Failed to delete field.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Fields</h1>
          <Link
            to="/fields/new"
            className="bg-green-800 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            New Field
          </Link>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && fields.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-16">No fields yet.</p>
        )}

        {!loading && fields.length > 0 && (
          <div className="bg-white border border-gray-100 rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Name</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Crop Type</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Stage</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Status</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Agent</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Planting Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field) => (
                  <tr key={field.id} className="even:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700 font-medium">{field.name}</td>
                    <td className="px-5 py-3 text-gray-700">{field.crop_type}</td>
                    <td className="px-5 py-3"><StageBadge stage={field.stage} /></td>
                    <td className="px-5 py-3"><StatusBadge status={field.status} /></td>
                    <td className="px-5 py-3 text-gray-700">{field.agent_name ?? field.agent?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {field.planting_date ? new Date(field.planting_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => navigate(`/fields/${field.id}`)}
                          className="text-sm text-green-800 hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(field.id)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
