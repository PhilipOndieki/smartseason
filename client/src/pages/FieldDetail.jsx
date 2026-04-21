import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import StageBadge from '../components/StageBadge'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const RISK_FLAGS = [
  'pest infestation',
  'disease outbreak',
  'drought stress',
  'waterlogging',
  'nutrient deficiency',
]

const STAGES = ['planted', 'growing', 'ready', 'harvested']

function UpdateForm({ fieldId, onSuccess }) {
  const [form, setForm] = useState({ stage: 'planted', notes: '', risk_flags: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleFlag(flag) {
    setForm((prev) => ({
      ...prev,
      risk_flags: prev.risk_flags.includes(flag)
        ? prev.risk_flags.filter((f) => f !== flag)
        : [...prev.risk_flags, flag],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/updates', { ...form, field_id: fieldId })
      setForm({ stage: 'planted', notes: '', risk_flags: [] })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit update.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded p-6 mt-6">
      <h2 className="text-sm font-medium text-gray-500 mb-4">Add Update</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-500 block mb-1">Stage</label>
          <select
            value={form.stage}
            onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
            className="w-full pb-2 border-b border-gray-300 focus:border-green-800 outline-none text-sm text-gray-700 bg-transparent"
          >
            {STAGES.map((s) => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 block mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={3}
            placeholder="Observation notes..."
            className="w-full pb-2 border-b border-gray-300 focus:border-green-800 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 block mb-2">Risk Flags</label>
          <div className="flex flex-wrap gap-3">
            {RISK_FLAGS.map((flag) => (
              <label key={flag} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.risk_flags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                  className="accent-green-800"
                />
                <span className="text-sm text-gray-700 capitalize">{flag}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-800 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit Update'}
        </button>
      </form>
    </div>
  )
}

export default function FieldDetail() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [field, setField] = useState(null)
  const [updates, setUpdates] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [fieldRes, updatesRes] = await Promise.all([
        api.get(`/fields/${id}`),
        api.get(`/updates/field/${id}`),
      ])
      setField(fieldRes.data)
      setUpdates(updatesRes.data)
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/dashboard')
      } else {
        setError('Failed to load field data.')
      }
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {field && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Field info */}
            <div className="md:w-80 shrink-0">
              <div className="bg-white border border-gray-100 rounded p-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">{field.name}</h1>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Crop Type</dt>
                    <dd className="text-sm text-gray-700 mt-0.5">{field.crop_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Planting Date</dt>
                    <dd className="text-sm text-gray-700 mt-0.5">
                      {field.planting_date ? new Date(field.planting_date).toLocaleDateString() : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Stage</dt>
                    <dd className="mt-1"><StageBadge stage={field.stage} /></dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1"><StatusBadge status={field.status} /></dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Assigned Agent</dt>
                    <dd className="text-sm text-gray-700 mt-0.5">
                      {field.agent_name ?? field.agent?.name ?? '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right: Updates */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-100 rounded p-6">
                <h2 className="text-sm font-medium text-gray-500 mb-4">Update History</h2>
                {updates.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No updates yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {updates.map((u, i) => (
                      <div key={u.id ?? i} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <StageBadge stage={u.stage} />
                          <span className="text-xs text-gray-400">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                          </span>
                        </div>
                        {u.notes && (
                          <p className="text-sm text-gray-700 mt-1">{u.notes}</p>
                        )}
                        {u.risk_flags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {u.risk_flags.map((flag) => (
                              <span
                                key={flag}
                                className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded"
                              >
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isAdmin && (
                <UpdateForm fieldId={Number(id)} onSuccess={fetchData} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
