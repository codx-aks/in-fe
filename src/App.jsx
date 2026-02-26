import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Registration from './pages/Registration'
import Verification from './pages/Verification'
import FoodCoupon from './pages/FoodCoupon'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/registration" element={
          <ProtectedRoute roles={['admin', 'registration_volunteer']}>
            <Registration />
          </ProtectedRoute>
        } />

        <Route path="/verification" element={
          <ProtectedRoute roles={['admin', 'verification_volunteer']}>
            <Verification />
          </ProtectedRoute>
        } />

        <Route path="/food" element={
          <ProtectedRoute roles={['admin', 'food_volunteer']}>
            <FoodCoupon />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
