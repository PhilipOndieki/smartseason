import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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
      const { data } = await api.post('/auth/login', form)
      login(data.data.token)
      // decode role from new token
      const payload = JSON.parse(atob(data.data.token.split('.')[1]))
      navigate(payload.role === 'admin' ? '/fields' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg p-8">
        <p className="text-green-800 font-medium text-base mb-8">SmartSeason</p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign in</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pb-2 border-b border-gray-300 focus:border-green-800 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pb-2 border-b border-gray-300 focus:border-green-800 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-800 text-white py-2.5 rounded text-sm hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-green-800 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
