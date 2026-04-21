import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import StageBadge from '../components/StageBadge'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function StatCard({ label, value, valueClass = 'text-gray-900' }) {
  return (
    <div className="bg-white border border-gray-100 rounded p-5">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${valueClass}`}>{value ?? '—'}</p>
    </div>
  )
}

function UpdatesTable({ updates }) {
  if (!updates?.length) {
    return <p className="text-sm text-gray-400 text-center py-8">No recent updates.</p>
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="text-left text-sm font-medium text-gray-500 pb-3">Field</th>
          <th className="text-left text-sm font-medium text-gray-500 pb-3">Agent</th>
          <th className="text-left text-sm font-medium text-gray-500 pb-3">Stage</th>
          <th className="text-left text-sm font-medium text-gray-500 pb-3">Notes</th>
          <th className="text-left text-sm font-medium text-gray-500 pb-3">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {updates.map((u, i) => (
          <tr key={u.id ?? i} className="even:bg-gray-50">
            <td className="py-3 pr-4 text-gray-700">{u.field_name ?? u.field?.name ?? '—'}</td>
            <td className="py-3 pr-4 text-gray-700">{u.agent_name ?? u.agent?.name ?? '—'}</td>
            <td className="py-3 pr-4"><StageBadge stage={u.stage} /></td>
            <td className="py-3 pr-4 text-gray-700 max-w-xs truncate">{u.notes ?? '—'}</td>
            <td className="py-3 text-gray-500 whitespace-nowrap">
              {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AdminDashboard({ data }) {
  const stats = {
    total_fields: data?.total_fields,
    active: data?.status_breakdown?.active,
    at_risk: data?.status_breakdown?.at_risk,
    completed: data?.status_breakdown?.completed,
  }
  const stageCounts = data?.fields_by_stage ?? {}
  const updates = data?.recent_updates ?? []
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Fields" value={stats.total_fields} />
        <StatCard label="Active" value={stats.active} valueClass="text-green-700" />
        <StatCard label="At Risk" value={stats.at_risk} valueClass="text-amber-600" />
        <StatCard label="Completed" value={stats.completed} valueClass="text-gray-400" />
      </div>

      <div className="bg-white border border-gray-100 rounded p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Recent Updates</h2>
        <UpdatesTable updates={updates} />
      </div>

      <div className="bg-white border border-gray-100 rounded p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Fields by Stage</h2>
        <div className="flex gap-8">
          {['planted', 'growing', 'ready', 'harvested'].map((stage) => (
            <div key={stage}>
              <p className="text-2xl font-semibold text-gray-900">{stageCounts[stage] ?? 0}</p>
              <p className="text-sm text-gray-500 capitalize mt-0.5">{stage}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function AgentDashboard({ data }) {
  const updates = data?.recent_updates ?? []

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Assigned Fields" value={data?.assigned_fields ?? 0} />
        <StatCard label="At Risk" value={data?.status_breakdown?.at_risk ?? 0} valueClass="text-amber-600" />
        <StatCard label="Completed" value={data?.status_breakdown?.completed ?? 0} valueClass="text-gray-400" />
      </div>

      <div className="bg-white border border-gray-100 rounded p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Recent Updates</h2>
        {updates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No updates yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">Field</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">Stage</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">Notes</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {updates.map((u, i) => (
                <tr key={u.id ?? i} className="even:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-700">{u.field_name ?? '—'}</td>
                  <td className="py-3 pr-4"><StageBadge stage={u.stage} /></td>
                  <td className="py-3 pr-4 text-gray-700 max-w-xs truncate">{u.notes ?? '—'}</td>
                  <td className="py-3 text-gray-500 whitespace-nowrap">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data?.assigned_fields === 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded p-4">
          <p className="text-sm text-amber-700">You have no fields assigned yet. Contact your coordinator to get started.</p>
        </div>
      )}
    </>
  )
}

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => setData(data.data))
      .catch(() => setError('Failed to load dashboard.'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Overview</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {!data && !error && <p className="text-sm text-gray-400">Loading...</p>}

        {data && (
          isAdmin
            ? <AdminDashboard data={data} />
            : <AgentDashboard data={data} />
        )}
      </main>
    </div>
  )
}
