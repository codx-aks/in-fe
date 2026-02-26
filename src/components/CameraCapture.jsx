import { useRef, useState, useCallback } from 'react'
import { Camera, RotateCcw, Check, X } from 'lucide-react'

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [streaming, setStreaming] = useState(false)
  const [captured, setCaptured] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [facingMode, setFacingMode] = useState('user')

  const startCamera = useCallback(async (mode = facingMode) => {
    setLoading(true)
    setError(null)
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStreaming(true)
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions and try again.')
    } finally {
      setLoading(false)
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setStreaming(false)
    if (onClose) onClose()
  }, [onClose])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    const dataURL = canvas.toDataURL('image/jpeg', 0.85)
    const base64 = dataURL.split(',')[1]
    setCaptured({ dataURL, base64 })
  }, [facingMode])

  const retake = () => {
    setCaptured(null)
  }

  const confirmCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    onCapture(captured.base64, captured.dataURL)
  }

  const toggleCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newMode)
    await startCamera(newMode)
  }

  return (
    <div className="w-full">
      {!streaming && !loading && (
        <button
          onClick={() => startCamera()}
          className="w-full flex flex-col items-center gap-4 border-2 border-dashed border-primary-700/50 hover:border-primary-700 rounded-xl p-8 transition-all duration-300 group hover:bg-primary-700/5"
        >
          <div className="w-16 h-16 bg-primary-700/20 rounded-full flex items-center justify-center group-hover:bg-primary-700/30 transition-colors">
            <Camera size={32} className="text-primary-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white">Open Camera</p>
            <p className="text-sm text-white/40 mt-1">Click to start capturing photo</p>
          </div>
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Starting camera...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-6">
          <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg mb-4">{error}</p>
          <button onClick={() => startCamera()} className="btn-primary text-sm px-4 py-2">
            Retry
          </button>
        </div>
      )}

      {streaming && !captured && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              playsInline
              muted
            />
            {/* Overlay guide */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-white/20 rounded-xl" />
              <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-primary-500 rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-primary-500 rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-primary-500 rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-primary-500 rounded-br-lg" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={capturePhoto} className="btn-primary flex-1">
              <Camera size={18} />
              Capture Photo
            </button>
            <button onClick={toggleCamera} className="btn-secondary px-4" title="Flip camera">
              <RotateCcw size={18} />
            </button>
            <button onClick={stopCamera} className="p-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {captured && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <img src={captured.dataURL} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              <Check size={12} />
              Captured
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={confirmCapture} className="btn-primary flex-1">
              <Check size={18} />
              Use This Photo
            </button>
            <button onClick={retake} className="btn-secondary">
              <RotateCcw size={18} />
              Retake
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
