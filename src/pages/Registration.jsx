import { useState } from 'react'
import Navbar from '../components/Navbar'
import QRScanner from '../components/QRScanner'
import CameraCapture from '../components/CameraCapture'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  UserPlus, QrCode, Camera, CheckCircle2, AlertCircle,
  ChevronRight, RefreshCw, Edit3
} from 'lucide-react'

const COLLEGES = [
  'NIT Trichy', 'NIT Raipur', 'NIT Calicut', 'NIT Puducherry',
  'NITK Surathkal', 'NIT Jamshedpur', 'NIT Warangal', 'NIT Kurukshetra',
  'NIT Silchar', 'NIT Durgapur', 'NIT Surat', 'NIT Bhopal',
  'NIT Patna', 'NIT Rourkela', 'NIT Allahabad', 'NIT Agartala',
  'Other'
]

const ROLES = ['Player', 'Manager', 'Coach', 'Referee', 'Support Staff']

const STEPS = ['scan', 'form', 'photo', 'confirm', 'done']

export default function Registration() {
  const [step, setStep]           = useState('scan')
  const [scannedId, setScannedId] = useState('')
  const [manualId, setManualId]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [photo, setPhoto]         = useState(null)
  const [form, setForm]           = useState({ name: '', college: '', sport: 'Hockey (M)', role: 'Player' })
  const [customCollege, setCustomCollege] = useState('')

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleScan = async (id) => {
    const pid = id.trim()
    setScannedId(pid)
    setLoading(true)
    try {
      const res = await api.get(`/api/participants/lookup/${pid}`)
      const d   = res.data
      if (d.already_registered) {
        toast.error('Already registered with a photo!')
        setStep('scan')
        return
      }
      setForm({
        name:    d.name    || '',
        college: d.college || '',
        sport:   d.sport   || 'Hockey (M)',
        role:    'Player',
      })
      setStep('form')
    } catch {
      toast.error('Lookup failed, please try again')
      setStep('scan')
    } finally {
      setLoading(false)
    }
  }

  const handleFormNext = () => {
    if (!form.name.trim())    { toast.error('Name is required'); return }
    const college = form.college === 'Other' ? customCollege : form.college
    if (!college.trim())      { toast.error('College is required'); return }
    setStep('photo')
  }

  const handleSubmit = async () => {
    const college = form.college === 'Other' ? customCollege : form.college
    setLoading(true)
    try {
      await api.post('/api/participants/register', {
        participant_id: scannedId,
        name:           form.name.trim(),
        college:        college.trim(),
        sport:          form.sport || 'Hockey (M)',
        photo_base64:   photo.base64,
      })
      toast.success(`${form.name} registered!`)
      setStep('done')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('scan'); setScannedId(''); setManualId('')
    setPhoto(null); setCustomCollege('')
    setForm({ name: '', college: '', sport: 'Hockey (M)', role: 'Player' })
  }

  const stepIdx = STEPS.indexOf(step)

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
            <UserPlus size={20} />
          </div>
          <div>
            <h1 className="font-display text-3xl text-white tracking-wider">REGISTRATION</h1>
            <p className="text-white/40 text-sm">Scan · Fill details · Capture photo</p>
          </div>
        </div>

        {/* Progress */}
        {step !== 'done' && (
          <div className="flex items-center gap-2 mb-6">
            {['Scan', 'Details', 'Photo', 'Confirm'].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    i < stepIdx ? 'bg-green-600 text-white'
                    : i === stepIdx ? 'bg-primary-700 text-white'
                    : 'bg-dark-600 text-white/30'
                  }`}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-white/40 hidden sm:block">{label}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px ${i < stepIdx ? 'bg-green-600/40' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* SCAN */}
        {step === 'scan' && (
          <div className="card space-y-5">
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-primary-400" />
              <h2 className="font-semibold text-white">Scan QR Code</h2>
            </div>
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/50 text-sm">Looking up…</p>
              </div>
            ) : (
              <>
                <QRScanner onScan={handleScan} label="Scan ID card QR" />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center py-2">
                    <span className="bg-dark-700 px-3 text-xs text-white/30 uppercase tracking-wider">or enter ID</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={manualId}
                    onChange={e => setManualId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && manualId && handleScan(manualId)}
                    className="input-field flex-1" placeholder="PLY-001 / REF-007 / OFF-003" />
                  <button onClick={() => manualId && handleScan(manualId)}
                    disabled={!manualId} className="btn-primary px-4">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* FORM */}
        {step === 'form' && (
          <div className="card space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-primary-400" />
                <h2 className="font-semibold text-white">Fill Details</h2>
              </div>
              <span className="text-xs font-mono bg-dark-600 text-white/40 px-2 py-1 rounded">
                {scannedId}
              </span>
            </div>

            <div>
              <label className="label">Full Name <span className="text-primary-500">*</span></label>
              <input type="text" value={form.name}
                onChange={e => set('name', e.target.value)}
                className="input-field" placeholder="Enter participant's full name"
                autoFocus />
            </div>

            <div>
              <label className="label">Role <span className="text-primary-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button key={r} onClick={() => set('role', r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      form.role === r
                        ? 'bg-primary-700 border-primary-700 text-white'
                        : 'bg-transparent border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">College <span className="text-primary-500">*</span></label>
              <select value={form.college} onChange={e => set('college', e.target.value)}
                className="input-field">
                <option value="">Select college…</option>
                {COLLEGES.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              {form.college === 'Other' && (
                <input type="text" value={customCollege}
                  onChange={e => setCustomCollege(e.target.value)}
                  className="input-field mt-2" placeholder="Type college / institution name" />
              )}
            </div>

            <div>
              <label className="label">Sport</label>
              <input type="text" value={form.sport}
                onChange={e => set('sport', e.target.value)}
                className="input-field" />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep('scan')} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleFormNext} className="btn-primary flex-1">
                <Camera size={16} /> Take Photo
              </button>
            </div>
          </div>
        )}

        {/* PHOTO */}
        {step === 'photo' && (
          <div className="card space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-primary-400" />
                <h2 className="font-semibold text-white">Capture Photo</h2>
              </div>
              <span className="text-sm text-white/40">{form.name}</span>
            </div>
            <CameraCapture
              onCapture={(b64, url) => { setPhoto({ base64: b64, dataURL: url }); setStep('confirm') }}
              onClose={() => setStep('form')}
            />
            <button onClick={() => setStep('form')} className="btn-secondary w-full">← Back</button>
          </div>
        )}

        {/* CONFIRM */}
        {step === 'confirm' && photo && (
          <div className="card space-y-5 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-primary-400" />
              <h2 className="font-semibold text-white">Confirm & Register</h2>
            </div>

            <div className="flex gap-4 bg-dark-600 rounded-xl p-4">
              <img src={photo.dataURL} alt="captured"
                className="w-20 h-20 object-cover rounded-xl border-2 border-primary-700/40 shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <p className="font-semibold text-white">{form.name}</p>
                <p className="text-white/50 text-sm">{form.college === 'Other' ? customCollege : form.college}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="badge bg-primary-700/30 text-primary-300 text-xs">{form.role}</span>
                  <span className="badge bg-dark-500 text-white/40 text-xs">{form.sport}</span>
                  <span className="badge bg-dark-500 text-white/30 text-xs font-mono">{scannedId}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 flex gap-2 text-sm">
              <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-400/70">Photo cannot be changed without admin access once saved.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('photo')} className="btn-secondary flex-1" disabled={loading}>
                Retake
              </button>
              <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                  : <><CheckCircle2 size={16} />Register</>
                }
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div className="card text-center py-8 space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} className="text-green-400" />
            </div>
            <div>
              <h2 className="font-display text-3xl text-white tracking-wider">REGISTERED!</h2>
              <p className="text-white/40 mt-1">{form.name} · {scannedId}</p>
            </div>
            {photo && (
              <img src={photo.dataURL} alt="registered"
                className="w-24 h-24 object-cover rounded-full border-4 border-primary-700 mx-auto" />
            )}
            <button onClick={reset} className="btn-primary mx-auto">
              <RefreshCw size={16} /> Register Next
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
