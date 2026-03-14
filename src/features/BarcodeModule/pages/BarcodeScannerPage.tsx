import { useRef, useCallback, useEffect, useState } from "react"
import BarcodeScannerComponent from "react-qr-barcode-scanner"
import { useBarcodeScanner } from "../hooks/useBarcodeScanner"
import { LogoutButton } from "../../../LogoutButton/LogoutButton"
import "./BarcodeScannerPage.css"

export default function BarcodeScannerPage() {
  const { product, loading, error, searchByBarcode } = useBarcodeScanner()

  const lastCodeRef      = useRef<string | null>(null)
  const isProcessingRef  = useRef(false)
  const resetTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cameraWrapRef    = useRef<HTMLDivElement>(null)
  const pollRef          = useRef<ReturnType<typeof setInterval> | null>(null)

  const [zoom, setZoom]                   = useState(1)
  const [zoomSupported, setZoomSupported] = useState(false)
  const [zoomRange, setZoomRange]         = useState({ min: 1, max: 4 })
  const [torchOn, setTorchOn]             = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)

  // ─── Obtiene el track desde el <video> que monta BarcodeScannerComponent ───
  // No abre un stream propio: reutiliza el que ya existe en el DOM.
  const getTrack = useCallback((): MediaStreamTrack | null => {
    const video = cameraWrapRef.current?.querySelector("video")
    if (!video) return null
    const stream = (video as HTMLVideoElement & { srcObject?: MediaStream }).srcObject
    return stream?.getVideoTracks()[0] ?? null
  }, [])

  // Polling hasta que el <video> tenga su stream listo (ocurre unos ms después del mount)
  useEffect(() => {
    pollRef.current = setInterval(() => {
      const track = getTrack()
      if (!track) return

      // Stream encontrado — dejamos de hacer polling
      clearInterval(pollRef.current!)
      pollRef.current = null

      const capabilities = track.getCapabilities() as any

      if (capabilities.zoom) {
        setZoomSupported(true)
        setZoomRange({
          min: capabilities.zoom.min ?? 1,
          max: Math.min(capabilities.zoom.max ?? 4, 4),
        })
      }

      if (capabilities.torch) {
        setTorchSupported(true)
      }

      // Foco continuo si está disponible (Android / Chrome)
      if (capabilities.focusMode?.includes?.("continuous")) {
        ;(track.applyConstraints as any)({
          advanced: [{ focusMode: "continuous" }],
        }).catch(() => {})
      }
    }, 300)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [getTrack])

  // ─── Zoom ───────────────────────────────────────────────────────────────────
  const applyZoom = useCallback(async (value: number) => {
    setZoom(value)
    const track = getTrack()
    if (!track) return
    try {
      await (track.applyConstraints as any)({ advanced: [{ zoom: value }] })
    } catch (_) {}
  }, [getTrack])

  // ─── Linterna ───────────────────────────────────────────────────────────────
  const toggleTorch = useCallback(async () => {
    const track = getTrack()
    if (!track) return
    try {
      const next = !torchOn
      await (track.applyConstraints as any)({ advanced: [{ torch: next }] })
      setTorchOn(next)
    } catch (_) {}
  }, [torchOn, getTrack])

  // ─── Lectura de código ──────────────────────────────────────────────────────
  const handleUpdate = useCallback(
    (err: unknown, result: any) => {
      if (err || !result) return

      const code: string = result.getText()
      if (!code || code.length < 4) return
      if (code === lastCodeRef.current || isProcessingRef.current) return

      lastCodeRef.current   = code
      isProcessingRef.current = true

      searchByBarcode(code).finally(() => {
        isProcessingRef.current = false

        if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
        resetTimerRef.current = setTimeout(() => {
          lastCodeRef.current = null
        }, 3000)
      })
    },
    [searchByBarcode]
  )

  return (
    <div className="scanner-page">
      {/* Header */}
      <div className="scanner-header">
        <h2>Escanear producto</h2>
        <p>Apuntá al código de barras</p>
      </div>

      {/* Cámara */}
      <div
        ref={cameraWrapRef}
        className={`scanner-camera ${product ? "has-result" : ""}`}
      >
        <BarcodeScannerComponent
          width={"100%"}
          height={"100%"}
          onUpdate={handleUpdate}
          facingMode="environment"
          // @ts-ignore — hints no está en todos los typings pero es válido en ZXing
          hints={new Map([
            [2, [
              "CODE_128", "CODE_39", "CODE_93",
              "EAN_13", "EAN_8", "UPC_A", "UPC_E",
              "ITF", "CODABAR",
              "QR_CODE", "DATA_MATRIX", "PDF_417", "AZTEC",
            ]],
            [3, true],           // TRY_HARDER
            [10, "ISO-8859-1"],  // CHARACTER_SET
          ])}
        />

        {/* Linterna */}
        {torchSupported && (
          <button
            className={`scanner-torch-btn ${torchOn ? "active" : ""}`}
            onClick={toggleTorch}
            aria-label={torchOn ? "Apagar linterna" : "Encender linterna"}
          >
            {torchOn ? "🔦" : "💡"}
          </button>
        )}
      </div>

      {/* Zoom — solo aparece en dispositivos que lo soporten (Android / Chrome) */}
      {zoomSupported && (
        <div className="scanner-zoom">
          <span className="zoom-icon">🔍</span>
          <input
            type="range"
            min={zoomRange.min}
            max={zoomRange.max}
            step={0.1}
            value={zoom}
            onChange={(e) => applyZoom(Number(e.target.value))}
            aria-label="Zoom de la cámara"
          />
          <span className="zoom-label">{zoom.toFixed(1)}×</span>
        </div>
      )}

      {/* Panel inferior */}
      <div className="scanner-bottom">
        {loading && (
          <p className="scanner-loading">Buscando producto…</p>
        )}
        {product && !loading && (
          <div className="scanner-result">
            <h3>{product.descripcion}</h3>
            <p className="price">
              ${Number(product.precio).toLocaleString()}
            </p>
            <p className="stock">Stock disponible: {product.stock}</p>
          </div>
        )}
        {error && !loading && (
          <p className="scanner-error">{error}</p>
        )}
      </div>

      <LogoutButton />
    </div>
  )
}