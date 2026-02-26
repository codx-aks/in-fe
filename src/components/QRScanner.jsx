import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { QrCode, X } from 'lucide-react'

export default function QRScanner({ onScan, onClose, label = "Scan QR Code" }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.clear().catch(() => {})
      }
    }
  }, [])

  const startScan = () => {
    setScanning(true)
    setError(null)

    setTimeout(() => {
      if (!scannerRef.current) return

      const scanner = new Html5QrcodeScanner(
        'qr-scanner-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showZoomSliderIfSupported: false,
          showTorchButtonIfSupported: true,
        },
        false
      )

      instanceRef.current = scanner

      scanner.render(
        (decodedText) => {
          scanner.clear().catch(() => {})
          setScanning(false)
          const raw = decodedText.trim()
          let parsed = raw
          try { parsed = JSON.parse(raw)?.participant_id || raw } catch {}
          onScan(parsed)
        },
        (err) => {
          // Ignore scan errors (just means no QR found in frame)
        }
      )
    }, 100)
  }

  const stopScan = () => {
    if (instanceRef.current) {
      instanceRef.current.clear().catch(() => {})
      instanceRef.current = null
    }
    setScanning(false)
    if (onClose) onClose()
  }

  return (
    <div className="w-full">
      {!scanning ? (
        <button
          onClick={startScan}
          className="w-full flex flex-col items-center gap-4 border-2 border-dashed border-primary-700/50 hover:border-primary-700 rounded-xl p-8 transition-all duration-300 group hover:bg-primary-700/5"
        >
          <div className="w-16 h-16 bg-primary-700/20 rounded-full flex items-center justify-center group-hover:bg-primary-700/30 transition-colors">
            <QrCode size={32} className="text-primary-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white">{label}</p>
            <p className="text-sm text-white/40 mt-1">Click to activate camera</p>
          </div>
        </button>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider">Camera Active</p>
            <button
              onClick={stopScan}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden">
            <div id="qr-scanner-container" ref={scannerRef} />
            <div className="scan-line pointer-events-none" />
          </div>
          <p className="text-center text-sm text-white/40 mt-3">
            Hold the QR code steady within the frame
          </p>
        </div>
      )}
      {error && (
        <p className="mt-3 text-red-400 text-sm text-center bg-red-400/10 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  )
}
