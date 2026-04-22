import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

  async function fetchUsers() {
    try {
      const { data } = await api.get('/auth/users')
      setUsers(data.data)
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleRoleChange(userId, newRole) {
    setUpdating(userId)
    try {
      await api.patch(`/auth/users/${userId}/role`, { role: newRole })
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} registered users</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && users.length > 0 && (
          <div className="bg-white border border-gray-100 rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Name</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Email</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Role</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-5 py-3">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="even:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {u.name}
                      {u.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-gray-400">(you)</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.id !== currentUser?.id ? (
                        <button
                          onClick={() =>
                            handleRoleChange(u.id, u.role === 'admin' ? 'agent' : 'admin')
                          }
                          disabled={updating === u.id}
                          className="text-xs text-green-800 border border-green-800 px-2.5 py-1 rounded hover:bg-green-800 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {updating === u.id
                            ? 'Saving...'
                            : u.role === 'admin'
                            ? 'Make Agent'
                            : 'Make Admin'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
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