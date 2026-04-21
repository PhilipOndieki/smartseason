import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('smartseason_token')
    if (stored) {
      const decoded = decodeToken(stored)
      if (decoded) {
        setToken(stored)
        setUser(decoded)
      } else {
        localStorage.removeItem('smartseason_token')
      }
    }
  }, [])

  function login(newToken) {
    localStorage.setItem('smartseason_token', newToken)
    const decoded = decodeToken(newToken)
    setToken(newToken)
    setUser(decoded)
  }

  function logout() {
    localStorage.removeItem('smartseason_token')
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
