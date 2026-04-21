import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import StageBadge from '../components/StageBadge'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const RISK_FLAGS = [
  'pest_infestation',
  'disease_outbreak',
  'drought_stress',
  'waterlogging',
  'nutrient_deficiency',
]

const STAGES = ['planted', 'growing', 'ready', 'harvested']

// Admin edit modal
function EditFieldModal({ field, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: field.name ?? '',
    crop_type: field.crop_type ?? '',
    planting_date: field.planting_date
      ? new Date(field.planting_date).toISOString().split('T')[0]
      : '',
    assigned_agent_id: field.assigned_agent_id ?? '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // update field details
      await api.patch(`/fields/${field.id}/assign`, {
        agent_id: Number(form.assigned_agent_id),
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update field.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg w-full max-w-md p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Edit Field</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
              Field Name
            </label>
            <input
              type="text"
              value={form.name}
              disabled
              className="w-full pb-2 border-b border-gray-100 text-sm text-gray-400 bg-transparent cursor-not-allowed"
            />
            <p className="text-xs text-gray-300 mt-1">Name cannot be changed after creation.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
              Reassign Agent
            </label>
            <input
              type="number"
              value={form.assigned_agent_id}
              onChange={(e) => setForm((p) => ({ ...p, assigned_agent_id: e.target.value }))}
              placeholder="Enter agent user ID"
              className="w-full pb-2 border-b border-gray-200 focus:border-green-800 outline-none text-sm text-gray-800 bg-transparent placeholder-gray-300 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">Current agent ID: {field.assigned_agent_id ?? 'unassigned'}</p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-800 text-white px-5 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-60 transition-colors font-medium"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

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
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-5">Submit Update</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Stage</label>
          <select
            value={form.stage}
            onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
            className="w-full pb-2 border-b border-gray-200 focus:border-green-800 outline-none text-sm text-gray-800 bg-transparent transition-colors"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={3}
            placeholder="Describe what you observed in the field..."
            className="w-full pb-2 border-b border-gray-200 focus:border-green-800 outline-none text-sm text-gray-800 bg-transparent placeholder-gray-300 resize-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-3">Risk Flags</label>
          <div className="grid grid-cols-2 gap-2">
            {RISK_FLAGS.map((flag) => (
              <label key={flag} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.risk_flags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                  className="accent-green-800"
                />
                <span className="text-sm text-gray-600 capitalize group-hover:text-gray-900">
                  {flag.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-800 text-white px-5 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-60 transition-colors font-medium"
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
  const [showEdit, setShowEdit] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [fieldRes, updatesRes] = await Promise.all([
        api.get(`/fields/${id}`),
        api.get(`/updates/field/${id}`),
      ])
      setField(fieldRes.data.data)
      setUpdates(updatesRes.data.data)
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

      {showEdit && field && (
        <EditFieldModal
          field={field}
          onClose={() => setShowEdit(false)}
          onSaved={fetchData}
        />
      )}

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <p className="text-sm text-gray-400 text-center py-16">Loading...</p>
        )}

        {field && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Field info */}
            <div className="md:w-80 shrink-0">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-5">
                  <h1 className="text-xl font-semibold text-gray-900 leading-tight">{field.name}</h1>
                  {isAdmin && (
                    <button
                      onClick={() => setShowEdit(true)}
                      className="text-xs text-green-800 border border-green-800 px-2.5 py-1 rounded hover:bg-green-800 hover:text-white transition-colors ml-2 shrink-0"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Crop Type</dt>
                    <dd className="text-sm text-gray-800 mt-1">{field.crop_type ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Planting Date</dt>
                    <dd className="text-sm text-gray-800 mt-1">
                      {field.planting_date
                        ? new Date(field.planting_date).toLocaleDateString()
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stage</dt>
                    <dd className="mt-1.5">
                      <StageBadge stage={field.current_stage} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</dt>
                    <dd className="mt-1.5">
                      <StatusBadge status={field.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Assigned Agent</dt>
                    <dd className="text-sm text-gray-800 mt-1">
                      {field.agent_name ?? '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right: Updates */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-gray-700">Update History</h2>
                  <span className="text-xs text-gray-400">{updates.length} updates</span>
                </div>

                {updates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-400">No updates submitted yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {updates.map((u, i) => (
                      <div key={u.id ?? i} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StageBadge stage={u.stage} />
                            {u.agent_name && (
                              <span className="text-xs text-gray-400">{u.agent_name}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {u.created_at
                              ? new Date(u.created_at).toLocaleDateString()
                              : '—'}
                          </span>
                        </div>
                        {u.notes && (
                          <p className="text-sm text-gray-700 leading-relaxed">{u.notes}</p>
                        )}
                        {u.risk_flags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {u.risk_flags.map((flag) => (
                              <span
                                key={flag}
                                className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded"
                              >
                                {flag.replace(/_/g, ' ')}
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