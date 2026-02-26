import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Trophy, Menu, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const roleLinks = {
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin', label: 'Admin Panel' },
    { to: '/registration', label: 'Registration' },
    { to: '/verification', label: 'Verify' },
    { to: '/food', label: 'Food' },
  ],
  registration_volunteer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/registration', label: 'Registration' },
  ],
  verification_volunteer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/verification', label: 'Verify' },
  ],
  food_volunteer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/food', label: 'Food Coupons' },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = roleLinks[user?.role] || []

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="bg-dark-800 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
            <Trophy size={16} className="text-white" />
          </div>
          <span className="font-display text-xl text-white tracking-widest hidden sm:block">
            INTER-NIT <span className="text-primary-500">2026</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? 'bg-primary-700 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">{user?.full_name}</p>
            <p className="text-xs text-primary-400 uppercase tracking-wider">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
          <button
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-dark-800 px-4 py-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? 'bg-primary-700 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
