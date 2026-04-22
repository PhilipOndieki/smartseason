import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Fields from './pages/Fields'
import FieldDetail from './pages/FieldDetail'
import NewField from './pages/NewField'
import MyFields from './pages/MyFields'
import Users from './pages/Users'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin-only: full field management */}
        <Route
          path="/fields"
          element={
            <AdminRoute>
              <Fields />
            </AdminRoute>
          }
        />
        <Route
          path="/fields/new"
          element={
            <AdminRoute>
              <NewField />
            </AdminRoute>
          }
        />

        {/* Agent-only: browse own assigned fields */}
        <Route
          path="/my-fields"
          element={
            <ProtectedRoute>
              <MyFields />
            </ProtectedRoute>
          }
        />

        {/* Both roles: field detail + update submission */}
        <Route
          path="/fields/:id"
          element={
            <ProtectedRoute>
              <FieldDetail />
            </ProtectedRoute>
          }
        />

        {/* users */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />       
      </Routes>
    </BrowserRouter>
  )
}