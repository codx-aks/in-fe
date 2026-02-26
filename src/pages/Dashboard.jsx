import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  UserPlus, ShieldCheck, Utensils, LayoutDashboard,
  Trophy, Users, QrCode, ArrowRight
} from 'lucide-react'

const roleCards = {
  admin: [
    {
      to: '/admin',
      icon: LayoutDashboard,
      title: 'Admin Panel',
      desc: 'Manage volunteers, view stats, configure tournament settings',
      color: 'from-primary-900 to-primary-800',
      accent: 'bg-primary-700',
    },
    {
      to: '/registration',
      icon: UserPlus,
      title: 'Registration',
      desc: 'Register participants with photo capture and QR scanning',
      color: 'from-dark-600 to-dark-700',
      accent: 'bg-blue-700',
    },
    {
      to: '/verification',
      icon: ShieldCheck,
      title: 'Verification',
      desc: 'Verify participant identity for match entry',
      color: 'from-dark-600 to-dark-700',
      accent: 'bg-emerald-700',
    },
    {
      to: '/food',
      icon: Utensils,
      title: 'Food Coupons',
      desc: 'Manage and track food distribution across all days',
      color: 'from-dark-600 to-dark-700',
      accent: 'bg-amber-700',
    },
  ],
  registration_volunteer: [
    {
      to: '/registration',
      icon: UserPlus,
      title: 'Register Participant',
      desc: 'Scan QR code and capture photo for participant registration',
      color: 'from-primary-900 to-primary-800',
      accent: 'bg-primary-700',
    },
  ],
  verification_volunteer: [
    {
      to: '/verification',
      icon: ShieldCheck,
      title: 'Verify Participant',
      desc: 'Scan QR and verify identity before match entry',
      color: 'from-primary-900 to-primary-800',
      accent: 'bg-primary-700',
    },
  ],
  food_volunteer: [
    {
      to: '/food',
      icon: Utensils,
      title: 'Food Coupons',
      desc: 'Scan QR code and mark meal consumption for participants',
      color: 'from-primary-900 to-primary-800',
      accent: 'bg-primary-700',
    },
  ],
}

export default function Dashboard() {
  const { user } = useAuth()
  const cards = roleCards[user?.role] || []

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-dark-800 border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(166,25,46,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(166,25,46,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} className="text-primary-500" />
            <span className="text-primary-400 font-semibold text-sm uppercase tracking-widest">
              Inter-NIT Tournament 2026
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-white tracking-wider mb-2">
            WELCOME BACK
          </h1>
          <p className="text-white/50 text-lg">
            {user?.full_name} &nbsp;·&nbsp;
            <span className="text-primary-400 capitalize">{user?.role?.replace(/_/g, ' ')}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="font-display text-2xl text-white tracking-wider mb-1">YOUR MODULES</h2>
          <p className="text-white/40 text-sm">Select a module to get started</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.to}
                to={card.to}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} border border-white/10 p-6 group hover:border-primary-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/30 hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 ${card.accent} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <ArrowRight size={18} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-display text-2xl text-white tracking-wider mb-2">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>

                {/* Decorative corner */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/[0.02] rounded-full" />
              </Link>
            )
          })}
        </div>

        {/* Quick info */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: QrCode, label: 'QR Enabled', desc: 'Camera-based scanning' },
            { icon: ShieldCheck, label: 'Secure', desc: 'JWT role-based access' },
            { icon: Users, label: 'Multi-Role', desc: 'Admin & Volunteer access' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-3 bg-dark-700/50 border border-white/5 rounded-xl px-4 py-3">
                <Icon size={18} className="text-primary-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
