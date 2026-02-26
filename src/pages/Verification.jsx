import { useState } from 'react'
import Navbar from '../components/Navbar'
import QRScanner from '../components/QRScanner'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ShieldCheck, QrCode, User, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'

export default function Verification() {
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(false)
  const [manualId, setManualId] = useState('')
  const [scanned, setScanned] = useState(false)

  const fetchParticipant = async (id) => {
    setLoading(true)
    setScanned(true)
    try {
      const res = await api.get(`/api/participants/${id.trim()}`)
      setParticipant(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Participant not found')
      } else {
        toast.error('Failed to fetch participant')
      }
      setParticipant(null)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setParticipant(null)
    setScanned(false)
    setManualId('')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-display text-3xl text-white tracking-wider">VERIFICATION</h1>
            <p className="text-white/40 text-sm">Match entry identity verification</p>
          </div>
        </div>

        {!scanned && (
          <div className="card space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <QrCode size={18} className="text-emerald-400" />
              <h2 className="font-semibold text-white">Scan Participant QR Code</h2>
            </div>
            <QRScanner onScan={fetchParticipant} label="Scan to Verify Identity" />
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
              <button
                onClick={() => manualId && fetchParticipant(manualId)}
                disabled={!manualId}
                className="btn-primary px-5"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="card flex flex-col items-center gap-4 py-10">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60">Verifying participant...</p>
          </div>
        )}

        {scanned && !loading && participant && (
          <div className="card space-y-5 animate-slide-up">
            {/* Status banner */}
            <div className={`-mx-6 -mt-6 px-6 py-4 rounded-t-xl ${participant.photo_base64 ? 'bg-emerald-700/20 border-b border-emerald-600/30' : 'bg-red-700/20 border-b border-red-600/30'}`}>
              <div className="flex items-center gap-2">
                {participant.photo_base64 ? (
                  <><CheckCircle2 size={20} className="text-emerald-400" /><span className="font-semibold text-emerald-300">Identity Verified</span></>
                ) : (
                  <><XCircle size={20} className="text-red-400" /><span className="font-semibold text-red-300">Not Registered — No Photo</span></>
                )}
              </div>
            </div>

            <div className="flex gap-5">
              {participant.photo_base64 ? (
                <img
                  src={`data:image/jpeg;base64,${participant.photo_base64}`}
                  alt={participant.name}
                  className="w-32 h-32 object-cover rounded-xl border-2 border-emerald-600/50 shrink-0"
                />
              ) : (
                <div className="w-32 h-32 bg-dark-600 rounded-xl border-2 border-red-600/30 flex items-center justify-center shrink-0">
                  <User size={40} className="text-white/20" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h2 className="font-display text-2xl text-white tracking-wide">{participant.name}</h2>
                <p className="text-white/50">{participant.college}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="badge bg-primary-700/30 text-primary-300">
                    {participant.sport}
                  </span>
                  <span className="badge bg-dark-600 text-white/50">
                    ID: {participant.participant_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Food status quick view */}
            {participant.food && (
              <div className="bg-dark-600 rounded-xl p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Food Consumption</p>
                <div className="grid grid-cols-3 gap-3">
                  {['day1', 'day2', 'day3'].map(day => (
                    <div key={day} className="space-y-1.5">
                      <p className="text-xs text-white/50 capitalize">{day.replace('day', 'Day ')}</p>
                      {['breakfast', 'lunch', 'dinner'].map(meal => (
                        <div key={meal} className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${participant.food[day][meal] ? 'bg-green-400' : 'bg-white/10'}`} />
                          <span className="text-xs text-white/40 capitalize">{meal}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={reset} className="btn-secondary w-full">
              <RefreshCw size={16} />
              Verify Another
            </button>
          </div>
        )}

        {scanned && !loading && !participant && (
          <div className="card text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-red-400" />
            </div>
            <p className="text-white/60">Participant not found in the system</p>
            <button onClick={reset} className="btn-secondary mx-auto">
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
