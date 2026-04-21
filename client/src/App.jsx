import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Fields from './pages/Fields'
import FieldDetail from './pages/FieldDetail'
import NewField from './pages/NewField'

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
        <Route
          path="/fields/:id"
          element={
            <ProtectedRoute>
              <FieldDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
