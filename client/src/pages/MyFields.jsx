import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import StageBadge from '../components/StageBadge'
import api from '../api/axios'

const STATUS_FILTERS = ['all', 'active', 'at_risk', 'completed']
const STAGE_FILTERS  = ['all', 'planted', 'growing', 'ready', 'harvested']

export default function MyFields() {
  const navigate = useNavigate()
  const [fields, setFields]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [statusFilter, setStatus]   = useState('all')
  const [stageFilter, setStage]     = useState('all')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    api.get('/fields')
      .then(({ data }) => setFields(data.data))
      .catch(() => setError('Failed to load your fields.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = fields.filter((f) => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false
    if (stageFilter  !== 'all' && f.current_stage !== stageFilter) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) &&
        !f.crop_type?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    active:    fields.filter((f) => f.status === 'active').length,
    at_risk:   fields.filter((f) => f.status === 'at_risk').length,
    completed: fields.filter((f) => f.status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Fields</h1>
          <p className="text-sm text-gray-500 mt-1">
            {fields.length} field{fields.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>

        {/* Summary strip */}
        {!loading && fields.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Active',    value: counts.active,    color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
              { label: 'At Risk',   value: counts.at_risk,   color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
              { label: 'Completed', value: counts.completed, color: 'text-gray-500',  bg: 'bg-gray-50 border-gray-100'  },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`border rounded p-4 ${bg}`}>
                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-semibold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {!loading && fields.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or crop type..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 bg-white focus:border-green-800 outline-none transition-colors placeholder-gray-400"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 bg-white focus:border-green-800 outline-none transition-colors"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={stageFilter}
              onChange={(e) => setStage(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 bg-white focus:border-green-800 outline-none transition-colors"
            >
              {STAGE_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All stages' : s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-sm text-gray-400 text-center py-16">Loading your fields...</p>
        )}

        {/* No fields at all */}
        {!loading && !error && fields.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-100 rounded">
            <p className="text-sm text-gray-500 mb-1">No fields assigned yet.</p>
            <p className="text-xs text-gray-400">Contact your coordinator to get started.</p>
          </div>
        )}

        {/* No results after filtering */}
        {!loading && fields.length > 0 && visible.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-100 rounded">
            <p className="text-sm text-gray-400">No fields match your filters.</p>
            <button
              onClick={() => { setStatus('all'); setStage('all'); setSearch('') }}
              className="text-sm text-green-800 mt-2 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Fields table */}
        {!loading && visible.length > 0 && (
          <div className="bg-white border border-gray-100 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Crop</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Stage</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Planted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((field) => (
                  <tr
                    key={field.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/fields/${field.id}`)}
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900">{field.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{field.crop_type ?? '—'}</td>
                    <td className="px-5 py-3.5"><StageBadge stage={field.current_stage} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={field.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {field.planting_date
                        ? new Date(field.planting_date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-green-800 hover:underline">
                        View →
                      </span>
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