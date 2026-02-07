import { useRef, useCallback } from "react"
import BarcodeScannerComponent from "react-qr-barcode-scanner"
import { useBarcodeScanner } from "../hooks/useBarcodeScanner"
import "./BarcodeScannerPage.css"

export default function BarcodeScannerPage() {
  const { product, loading, error, searchByBarcode } =
    useBarcodeScanner()

  const lastCodeRef = useRef<string | null>(null)
  const isProcessingRef = useRef(false)

  const handleUpdate = useCallback(
    (err: unknown, result: any) => {
      if (err || !result) return

      const code = result.getText()

      // Evitar lecturas duplicadas
      if (
        code === lastCodeRef.current ||
        isProcessingRef.current
      )
        return

      lastCodeRef.current = code
      isProcessingRef.current = true

      searchByBarcode(code).finally(() => {
        isProcessingRef.current = false
      })
    },
    [searchByBarcode]
  )

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <h2>Escanear producto</h2>
        <p>Apuntá al código de barras</p>
      </div>

      <div className="scanner-camera">
        <BarcodeScannerComponent
    width={window.innerWidth}
    height={window.innerHeight * 0.7}
    onUpdate={handleUpdate}
  />
      </div>

      {loading && (
        <p className="scanner-loading">Buscando producto…</p>
      )}

      {product && !loading && (
        <div className="scanner-result">
          <h3>{product.descripcion}</h3>
          <p className="price">${product.precio}</p>
        </div>
      )}

      {error && !loading && (
        <p className="scanner-error">{error}</p>
      )}
    </div>
  )
}
