import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'
import {
  Users, UserPlus, Trophy, BarChart3, Settings, Utensils,
  Trash2, Calendar, RefreshCw, Eye, EyeOff, Shield, ChevronDown, ChevronUp
} from 'lucide-react'

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [foodStats, setFoodStats] = useState(null)
  const [users, setUsers] = useState([])
  const [tournamentDate, setTournamentDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'registration_volunteer', full_name: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, username: '' })
  const [creating, setCreating] = useState(false)
  const [savingDate, setSavingDate] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [ovRes, foodRes, usersRes, tourRes] = await Promise.all([
        api.get('/api/admin/overview'),
        api.get('/api/food/dashboard'),
        api.get('/api/auth/users'),
        api.get('/api/food/tournament-settings'),
      ])
      setOverview(ovRes.data)
      setFoodStats(foodRes.data)
      setUsers(usersRes.data)
      if (tourRes.data.start_date) setTournamentDate(tourRes.data.start_date)
    } catch (err) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!newUser.username || !newUser.password || !newUser.full_name) {
      toast.error('Fill in all fields')
      return
    }
    setCreating(true)
    try {
      await api.post('/api/auth/create-user', newUser)
      toast.success(`User "${newUser.username}" created!`)
      setNewUser({ username: '', password: '', role: 'registration_volunteer', full_name: '' })
      await fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/api/auth/users/${deleteModal.username}`)
      toast.success('User deleted')
      setDeleteModal({ open: false, username: '' })
      await fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user')
    }
  }

  const handleSaveTournamentDate = async () => {
    if (!tournamentDate) return
    setSavingDate(true)
    try {
      await api.post('/api/food/tournament-settings', { start_date: tournamentDate })
      toast.success('Tournament start date saved!')
    } catch {
      toast.error('Failed to save date')
    } finally {
      setSavingDate(false)
    }
  }

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'food', label: 'Food Stats', icon: Utensils },
    { key: 'users', label: 'Volunteers', icon: Users },
    { key: 'settings', label: 'Settings', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="font-display text-3xl text-white tracking-wider">ADMIN PANEL</h1>
              <p className="text-white/40 text-sm">Tournament management console</p>
            </div>
          </div>
          <button onClick={fetchAll} className="btn-secondary px-4 py-2 text-sm">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-800 border border-white/10 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === tab.key ? 'bg-primary-700 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Participants', value: overview.total_participants, color: 'text-white' },
                { label: 'Photo Registered', value: overview.registered_with_photo, color: 'text-green-400' },
                { label: 'Pending', value: overview.pending_registration, color: 'text-amber-400' },
                { label: 'Total Volunteers', value: overview.total_volunteers, color: 'text-blue-400' },
              ].map(stat => (
                <div key={stat.label} className="stat-card">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className={`font-display text-4xl ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {overview.role_breakdown && overview.role_breakdown.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-primary-400" />
                  Role Distribution
                </h3>
                <div className="space-y-2">
                  {overview.role_breakdown.map(({ _id: role, count }) => (
                    <div key={role} className="flex items-center gap-3">
                      <span className="text-sm text-white/60 capitalize w-48">{role?.replace(/_/g, ' ')}</span>
                      <div className="flex-1 bg-dark-600 rounded-full h-2">
                        <div
                          className="bg-primary-700 h-2 rounded-full"
                          style={{ width: `${Math.min((count / overview.total_volunteers) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-white/60 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Food stats tab */}
        {activeTab === 'food' && foodStats && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['day1', 'day2', 'day3'].map(day => (
                <div key={day} className="card">
                  <h3 className="font-display text-xl text-white tracking-wide mb-4">
                    {day.replace('day', 'Day ')}
                  </h3>
                  <div className="space-y-3">
                    {['breakfast', 'lunch', 'dinner'].map(meal => {
                      const count = foodStats[`${day}_${meal}`] || 0
                      const total = overview?.total_participants || 1
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={meal}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/60 capitalize">{meal}</span>
                            <span className="text-white font-mono">{count}</span>
                          </div>
                          <div className="bg-dark-600 rounded-full h-1.5">
                            <div
                              className="bg-amber-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteers tab */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            {/* Create user form */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <UserPlus size={16} className="text-primary-400" />
                Create Volunteer Account
              </h3>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="label">Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))}
                    className="input-field"
                    placeholder="volunteer_01"
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newUser.password}
                      onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                      className="input-field pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                    className="input-field"
                  >
                    <option value="registration_volunteer">Registration Volunteer</option>
                    <option value="verification_volunteer">Verification Volunteer</option>
                    <option value="food_volunteer">Food Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={creating} className="btn-primary">
                    {creating ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                    ) : (
                      <><UserPlus size={16} />Create Account</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Users list */}
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Existing Accounts ({users.length})</h3>
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.username} className="flex items-center gap-3 bg-dark-600 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-primary-700/30 rounded-lg flex items-center justify-center shrink-0">
                      <Users size={14} className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-white/40">@{user.username} · <span className="capitalize">{user.role?.replace(/_/g, ' ')}</span></p>
                    </div>
                    <span className={`badge text-xs ${user.is_active ? 'bg-green-700/20 text-green-400' : 'bg-red-700/20 text-red-400'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => setDeleteModal({ open: true, username: user.username })}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="card max-w-lg">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-primary-400" />
              Tournament Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Tournament Start Date</label>
                <input
                  type="date"
                  value={tournamentDate}
                  onChange={e => setTournamentDate(e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-white/30 mt-1.5">
                  Used to auto-calculate the current tournament day for food tracking
                </p>
              </div>
              <button onClick={handleSaveTournamentDate} disabled={!tournamentDate || savingDate} className="btn-primary">
                {savingDate ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteModal({ open: false, username: '' })}
        title="Delete User"
        message={`Are you sure you want to delete "@${deleteModal.username}"? This action cannot be undone.`}
        confirmText="Delete User"
        dangerous
      />
    </div>
  )
}
