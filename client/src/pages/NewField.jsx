import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function NewField() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    crop_type: '',
    planting_date: '',
    assigned_agent_id: '',
  })
  const [agents, setAgents] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/auth/agents')
      .then(({ data }) => setAgents(data.data))
      .catch(() => setAgents([]))
  }, [])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/fields', {
        name: form.name,
        crop_type: form.crop_type,
        planting_date: form.planting_date || undefined,
        assigned_agent_id: form.assigned_agent_id ? Number(form.assigned_agent_id) : undefined,
      })
      navigate('/fields')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create field.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-lg mx-auto px-6 pt-10 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">New Field</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new field to the monitoring system.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                Field Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. North Block A"
                className="w-full pb-2 border-b border-gray-200 focus:border-green-800 outline-none text-sm text-gray-800 bg-transparent placeholder-gray-300 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                Crop Type
              </label>
              <input
                type="text"
                name="crop_type"
                value={form.crop_type}
                onChange={handleChange}
                placeholder="e.g. Maize, Wheat, Sorghum"
                className="w-full pb-2 border-b border-gray-200 focus:border-green-800 outline-none text-sm text-gray-800 bg-transparent placeholder-gray-300 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                Planting Date
              </label>
              <input
                type="date"
                name="planting_date"
                value={form.planting_date}
                onChange={handleChange}
                className="w-full pb-2 border-b border-gray-200 focus:border-green-800 outline-none text-sm text-gray-800 bg-transparent transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                Assign to Agent
              </label>
              <select
                name="assigned_agent_id"
                value={form.assigned_agent_id}
                onChange={handleChange}
                className="w-full pb-2 border-b border-gray-200 focus:border-green-800 outline-none text-sm text-gray-800 bg-transparent transition-colors"
              >
                <option value="">— Unassigned —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.email})
                  </option>
                ))}
              </select>
              {agents.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">No agents registered yet.</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-800 text-white px-6 py-2.5 rounded text-sm hover:bg-green-700 disabled:opacity-60 transition-colors font-medium"
              >
                {loading ? 'Creating...' : 'Create Field'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/fields')}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}