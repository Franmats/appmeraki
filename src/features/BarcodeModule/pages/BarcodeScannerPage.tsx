import { useRef, useCallback, useEffect, useState } from "react"
import BarcodeScannerComponent from "react-qr-barcode-scanner"
import { useBarcodeScanner } from "../hooks/useBarcodeScanner"
import { LogoutButton } from "../../../LogoutButton/LogoutButton"
import "./BarcodeScannerPage.css"

export default function BarcodeScannerPage() {
  const { product, loading, error, notFound, searchByBarcode } = useBarcodeScanner()

  const lastCodeRef       = useRef<string | null>(null)
  const isProcessingRef   = useRef(false)
  const resetTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cameraWrapRef     = useRef<HTMLDivElement>(null)
  const pollRef           = useRef<ReturnType<typeof setInterval> | null>(null)

  const [zoom, setZoom]                         = useState(1)
  const [zoomSupported, setZoomSupported]   = useState(false)
  const [zoomRange, setZoomRange]           = useState({ min: 1, max: 4 })
  const [torchOn, setTorchOn]               = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)

  const [isModalOpen, setIsModalOpen]       = useState(false)

  // Cambia en cada resultado nuevo para poder re-disparar las animaciones
  // de entrada aunque el pop-up ya esté abierto (ej: escaneás otro código
  // sin cerrar el anterior).
  const [scanToken, setScanToken] = useState(0)

  // Último código efectivamente procesado (distinto del DEBUG: este sí se
  // usa en producción, para poder mostrárselo al usuario cuando el código
  // se lee bien pero el producto no está cargado en el sistema).
  const [lastScannedCode, setLastScannedCode] = useState<string>("")

  // DEBUG — queda disponible para desarrollo pero nunca se muestra en producción.
  const [debugCode, setDebugCode]   = useState<string>("")
  const [debugError, setDebugError] = useState<string>("")
  const isDev = import.meta.env.DEV

  useEffect(() => {
    if (loading || product || error) {
      setIsModalOpen(true)
      setScanToken((n) => n + 1)
    }
  }, [loading, product, error])

  const getTrack = useCallback((): MediaStreamTrack | null => {
    const video = cameraWrapRef.current?.querySelector("video")
    if (!video) return null
    const stream = (video as HTMLVideoElement & { srcObject?: MediaStream }).srcObject
    return stream?.getVideoTracks()[0] ?? null
  }, [])

  useEffect(() => {
    pollRef.current = setInterval(() => {
      const track = getTrack()
      if (!track) return

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

      if (capabilities.torch) setTorchSupported(true)

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

  const applyZoom = useCallback(async (value: number) => {
    setZoom(value)
    const track = getTrack()
    if (!track) return
    try {
      await (track.applyConstraints as any)({ advanced: [{ zoom: value }] })
    } catch (_) {}
  }, [getTrack])

  const toggleTorch = useCallback(async () => {
    const track = getTrack()
    if (!track) return
    try {
      const next = !torchOn
      await (track.applyConstraints as any)({ advanced: [{ torch: next }] })
      setTorchOn(next)
    } catch (_) {}
  }, [torchOn, getTrack])

  const handleUpdate = useCallback(
    (err: unknown, result: any) => {
      if (err || !result) return

      const code: string = result.getText()

      setDebugCode(`Código: "${code}" | largo: ${code.length}`)

      if (!code || code.length < 4) return
      if (code === lastCodeRef.current || isProcessingRef.current) return

      lastCodeRef.current     = code
      isProcessingRef.current = true
      setLastScannedCode(code)

      searchByBarcode(code)
        .catch((e: unknown) => {
          const msg = e instanceof Error ? e.message : String(e)
          setDebugError(`Error API: ${msg}`)
        })
        .finally(() => {
          isProcessingRef.current = false
          if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
          resetTimerRef.current = setTimeout(() => {
            lastCodeRef.current = null
          }, 3000)
        })
    },
    [searchByBarcode]
  )

  const handleDismiss = () => {
    setIsModalOpen(false)
    lastCodeRef.current = null
  }

  const showPopup = isModalOpen && (loading || product || error)

  return (
    <div className="scanner-page">
      <div ref={cameraWrapRef} className="scanner-camera-fullscreen">
        <BarcodeScannerComponent
          width={"100%"}
          height={"100%"}
          onUpdate={handleUpdate}
          facingMode="environment"
          // @ts-ignore
          hints={new Map([
            [2, [
              "CODE_128", "CODE_39", "CODE_93",
              "EAN_13", "EAN_8", "UPC_A", "UPC_E",
              "ITF", "CODABAR",
              "QR_CODE", "DATA_MATRIX", "PDF_417", "AZTEC",
            ]],
            [3, true],
            [10, "ISO-8859-1"],
          ])}

        />
        <div className="scanner-overlay-laser"></div>
      </div>

      <div className="scanner-header-floating">
        <h2>Escanear producto</h2>
        <p>Apuntá al código dentro del recuadro</p>
      </div>

      <div className="scanner-controls-floating">
        {zoomSupported && (
          <div className="scanner-zoom-pill">
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

      <div className="scanner-logout-floating">
        <LogoutButton />
      </div>

      {showPopup && (
        <div className="scanner-popup-backdrop">
          <div className="scanner-popup-card" key={scanToken}>
            <button className="popup-close-btn" onClick={handleDismiss} aria-label="Cerrar">
              ✕
            </button>

            {isDev && (
              <div className="scanner-debug-box">
                <strong style={{ color: "#facc15" }}>🛠 DEBUG</strong><br />
                {debugCode || "Esperando escaneo…"}<br />
                {debugError && <span style={{ color: "#f87171" }}>{debugError}</span>}
              </div>
            )}

            {loading && (
              <div className="scanner-loading">
                <span className="scanner-spinner" aria-hidden="true" />
                <p>Buscando producto…</p>
              </div>
            )}

            {product && !loading && (
              <div className="scanner-result">
                <h3>{product.nombre}</h3>
                <p className="description">{product.descripcion}</p>
                <p className="price">${Number(product.precio).toLocaleString()}</p>
                <div className="product-meta">
                  <p><b>Stock:</b> {product.stock || "Sin datos"}</p>
                  <p><b>Código:</b> {product.codigo_barras || "Sin datos"}</p>
                  <p><b>Rubro:</b> {product.rubro || "Sin datos"}</p>
                </div>
              </div>
            )}

            {error && !loading && (
              notFound ? (
                <div className="scanner-not-found">
                  <span className="scanner-not-found__icon" aria-hidden="true">🔎</span>
                  <p className="scanner-not-found__title">Código leído, pero no está cargado en el sistema</p>
                  {lastScannedCode && <p className="scanner-not-found__code">{lastScannedCode}</p>}
                  <p className="scanner-not-found__hint">Pedile a un encargado que lo cargue y volvé a escanear.</p>
                </div>
              ) : (
                <p className="scanner-error">{error}</p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}