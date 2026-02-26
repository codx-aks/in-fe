import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', dangerous = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-dark-700 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={16} />
        </button>
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
          dangerous ? 'bg-red-500/20' : 'bg-primary-700/20'
        }`}>
          <AlertTriangle size={24} className={dangerous ? 'text-red-400' : 'text-primary-500'} />
        </div>

        <h3 className="font-display text-xl text-white mb-2">{title}</h3>
        <p className="text-white/60 text-sm mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
              dangerous
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-primary-700 hover:bg-primary-600 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
