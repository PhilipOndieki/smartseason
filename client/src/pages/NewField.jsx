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
    agent_id: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/fields', {
        ...form,
        agent_id: form.agent_id ? Number(form.agent_id) : undefined,
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">New Field</h1>

        <div className="bg-white border border-gray-100 rounded p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Field name"
                className="w-full pb-2 border-b border-gray-300 focus:border-green-800 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Crop Type</label>
              <input
                type="text"
                name="crop_type"
                value={form.crop_type}
                onChange={handleChange}
                required
                placeholder="e.g. Maize, Wheat"
                className="w-full pb-2 border-b border-gray-300 focus:border-green-800 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Planting Date</label>
              <input
                type="date"
                name="planting_date"
                value={form.planting_date}
                onChange={handleChange}
                className="w-full pb-2 border-b border-gray-300 focus:border-green-800 outline-none text-sm text-gray-700 bg-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-1">Assign to Agent</label>
              <input
                type="number"
                name="agent_id"
                value={form.agent_id}
                onChange={handleChange}
                placeholder="Enter agent user ID"
                className="w-full pb-2 border-b border-gray-300 focus:border-green-800 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Enter the numeric user ID of the agent to assign.</p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-800 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-60"
              >
                {loading ? 'Creating...' : 'Create Field'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/fields')}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
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
