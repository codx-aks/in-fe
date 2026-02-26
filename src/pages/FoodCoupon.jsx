import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import QRScanner from '../components/QRScanner'
import ConfirmModal from '../components/ConfirmModal'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Utensils, QrCode, CheckCircle2, XCircle, RefreshCw, Calendar, Sun, Sunset, Moon, User } from 'lucide-react'

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', icon: Sun, time: '7:00 – 9:00 AM' },
  { key: 'lunch', label: 'Lunch', icon: Utensils, time: '12:30 – 2:30 PM' },
  { key: 'dinner', label: 'Dinner', icon: Moon, time: '7:30 – 9:30 PM' },
]

function calculateCurrentDay(startDate) {
  if (!startDate) return 'day1'
  const start = new Date(startDate)
  const today = new Date()
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'day1'
  if (diffDays === 1) return 'day2'
  if (diffDays >= 2) return 'day3'
  return 'day1'
}

export default function FoodCoupon() {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)
  const [manualId, setManualId] = useState('')
  const [scanned, setScanned] = useState(false)
  const [tournamentStart, setTournamentStart] = useState(null)
  const [selectedDay, setSelectedDay] = useState('day1')
  const [selectedMeal, setSelectedMeal] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    fetchTournamentSettings()
  }, [])

  const fetchTournamentSettings = async () => {
    try {
      const res = await api.get('/api/food/tournament-settings')
      if (res.data.start_date) {
        setTournamentStart(res.data.start_date)
        setSelectedDay(calculateCurrentDay(res.data.start_date))
      }
    } catch {}
  }

  const fetchParticipant = async (id) => {
    setLoading(true)
    setScanned(true)
    try {
      const res = await api.get(`/api/participants/${id.trim()}`)
      setParticipant(res.data)
    } catch (err) {
      toast.error(err.response?.status === 404 ? 'Participant not found' : 'Failed to fetch participant')
      setParticipant(null)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkFood = () => {
    if (!selectedMeal) {
      toast.error('Please select a meal')
      return
    }
    // Check if already consumed
    if (participant?.food?.[selectedDay]?.[selectedMeal]) {
      toast.error(`${selectedMeal} already consumed on ${selectedDay.replace('day', 'Day ')}!`)
      return
    }
    setConfirmOpen(true)
  }

  const confirmMark = async () => {
    setConfirmOpen(false)
    setMarking(true)
    try {
      const res = await api.post('/api/food/mark', {
        participant_id: participant.participant_id,
        day: selectedDay,
        meal: selectedMeal,
      })
      toast.success(`✅ ${res.data.meal} marked for ${res.data.participant_name}`)
      // Refresh participant data
      const updated = await api.get(`/api/participants/${participant.participant_id}`)
      setParticipant(updated.data)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to mark meal'
      toast.error(msg)
    } finally {
      setMarking(false)
    }
  }

  const reset = () => {
    setParticipant(null)
    setScanned(false)
    setManualId('')
    setSelectedMeal('')
  }

  const isMealConsumed = (day, meal) => participant?.food?.[day]?.[meal] === true

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-700 rounded-xl flex items-center justify-center">
            <Utensils size={20} />
          </div>
          <div>
            <h1 className="font-display text-3xl text-white tracking-wider">FOOD COUPONS</h1>
            <p className="text-white/40 text-sm">Meal distribution tracking</p>
          </div>
          {tournamentStart && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-white/40 bg-dark-700 border border-white/10 rounded-lg px-3 py-2">
              <Calendar size={12} />
              <span>Day: <strong className="text-white">{selectedDay.replace('day', '')}</strong></span>
            </div>
          )}
        </div>

        {/* Scanner */}
        {!scanned && (
          <div className="card space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <QrCode size={18} className="text-amber-400" />
              <h2 className="font-semibold text-white">Scan Participant QR</h2>
            </div>
            <QRScanner onScan={fetchParticipant} label="Scan to Mark Food" />
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-dark-700 px-3 text-xs text-white/30 uppercase tracking-wider">or enter manually</span>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && manualId && fetchParticipant(manualId)}
                className="input-field flex-1"
                placeholder="Enter participant ID"
              />
              <button onClick={() => manualId && fetchParticipant(manualId)} disabled={!manualId} className="btn-primary px-5">
                Fetch
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="card flex flex-col items-center gap-4 py-10">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60">Loading participant...</p>
          </div>
        )}

        {scanned && !loading && participant && (
          <div className="space-y-5 animate-slide-up">
            {/* Participant info */}
            <div className="card">
              <div className="flex gap-4">
                {participant.photo_base64 ? (
                  <img
                    src={`data:image/jpeg;base64,${participant.photo_base64}`}
                    alt={participant.name}
                    className="w-20 h-20 object-cover rounded-xl border-2 border-amber-600/40 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-dark-600 rounded-xl flex items-center justify-center shrink-0">
                    <User size={28} className="text-white/20" />
                  </div>
                )}
                <div>
                  <h2 className="font-display text-xl text-white tracking-wide">{participant.name}</h2>
                  <p className="text-white/40 text-sm">{participant.college}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge bg-amber-700/30 text-amber-300 text-xs">{participant.sport}</span>
                    <span className="badge bg-dark-600 text-white/40 text-xs">ID: {participant.participant_id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Day selector */}
            <div className="card">
              <label className="label">Select Day</label>
              <div className="grid grid-cols-3 gap-2">
                {['day1', 'day2', 'day3'].map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      selectedDay === day
                        ? 'bg-primary-700 text-white'
                        : 'bg-dark-600 text-white/50 hover:bg-dark-500'
                    }`}
                  >
                    {day.replace('day', 'Day ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal selector */}
            <div className="card">
              <label className="label">Select Meal</label>
              <div className="space-y-2">
                {MEALS.map(({ key, label, icon: Icon, time }) => {
                  const consumed = isMealConsumed(selectedDay, key)
                  return (
                    <button
                      key={key}
                      onClick={() => !consumed && setSelectedMeal(key)}
                      disabled={consumed}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        consumed
                          ? 'bg-green-900/20 border-green-700/30 cursor-not-allowed opacity-60'
                          : selectedMeal === key
                          ? 'bg-primary-700/20 border-primary-700/60'
                          : 'bg-dark-600 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        consumed ? 'bg-green-700/30' : selectedMeal === key ? 'bg-primary-700/40' : 'bg-dark-500'
                      }`}>
                        <Icon size={18} className={consumed ? 'text-green-400' : selectedMeal === key ? 'text-primary-400' : 'text-white/40'} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold text-sm ${consumed ? 'text-green-300' : 'text-white'}`}>{label}</p>
                        <p className="text-xs text-white/30">{time}</p>
                      </div>
                      {consumed ? (
                        <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                      ) : selectedMeal === key ? (
                        <div className="w-4 h-4 rounded-full bg-primary-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary flex-1">
                <RefreshCw size={16} />
                New Scan
              </button>
              <button
                onClick={handleMarkFood}
                disabled={!selectedMeal || marking}
                className="btn-primary flex-1"
              >
                {marking ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Marking...</>
                ) : (
                  <><CheckCircle2 size={18} />Mark as Consumed</>
                )}
              </button>
            </div>
          </div>
        )}

        {scanned && !loading && !participant && (
          <div className="card text-center py-8 space-y-4">
            <XCircle size={40} className="text-red-400 mx-auto" />
            <p className="text-white/60">Participant not found</p>
            <button onClick={reset} className="btn-secondary mx-auto">
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onConfirm={confirmMark}
        onCancel={() => setConfirmOpen(false)}
        title="Confirm Meal"
        message={`Mark ${selectedMeal} on ${selectedDay?.replace('day', 'Day ')} for ${participant?.name}? This cannot be undone.`}
        confirmText="Mark as Consumed"
      />
    </div>
  )
}
