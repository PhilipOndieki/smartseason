import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="h-14 bg-white border-b border-gray-100 flex items-center px-6">
      <Link to={isAdmin ? '/fields' : '/dashboard'} className="text-green-800 font-medium text-base mr-auto">
        SmartSeason
      </Link>
      <div className="flex items-center gap-6">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-sm text-gray-600 hover:text-gray-900 ${isActive ? 'text-green-800 border-b border-green-800 pb-0.5' : ''}`
          }
        >
          Dashboard
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/fields"
            className={({ isActive }) =>
              `text-sm text-gray-600 hover:text-gray-900 ${isActive ? 'text-green-800 border-b border-green-800 pb-0.5' : ''}`
            }
          >
            Fields
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
