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
    <nav className="h-14 bg-white border-b border-gray-200 shadow-sm flex items-center px-8 sticky top-0 z-50">
      <Link
        to={isAdmin ? '/fields' : '/dashboard'}
        className="text-green-800 font-semibold text-base mr-auto tracking-tight"
      >
        SmartSeason
      </Link>

      <div className="flex items-center gap-8">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-sm transition-colors ${
              isActive
                ? 'text-green-800 font-medium border-b-2 border-green-800 pb-0.5'
                : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          Dashboard
        </NavLink>

        {isAdmin ? (
          <>
            <NavLink
              to="/fields"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive
                    ? 'text-green-800 font-medium border-b-2 border-green-800 pb-0.5'
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              Fields
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive
                    ? 'text-green-800 font-medium border-b-2 border-green-800 pb-0.5'
                    : 'text-gray-500 hover:text-gray-900'
                }`
              }
            >
              Users
            </NavLink>
          </>
        ) : (
          <NavLink
            to="/my-fields"
            className={({ isActive }) =>
              `text-sm transition-colors ${
                isActive
                  ? 'text-green-800 font-medium border-b-2 border-green-800 pb-0.5'
                  : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            My Fields
          </NavLink>
        )}

        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}