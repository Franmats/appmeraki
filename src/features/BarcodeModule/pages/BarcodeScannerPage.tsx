import BarcodeScannerComponent from "react-qr-barcode-scanner"
import { useBarcodeScanner } from "../hooks/useBarcodeScanner"
import "./BarcodeScannerPage.css"

export default function BarcodeScannerPage() {
  const { product, loading, error, searchByBarcode } =
    useBarcodeScanner()

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <h2>Escanear producto</h2>
        <p>Apuntá al código de barras</p>
      </div>

      <div className="scanner-camera">
        <BarcodeScannerComponent
          width={300}
          height={300}
          onUpdate={(err, result) => {
            if (result) searchByBarcode(result.getText())
          }}
        />
      </div>

      {loading && (
        <p className="scanner-loading">Buscando producto…</p>
      )}

      {product && (
        <div className="scanner-result">
          <h3>{product.descripcion}</h3>
          <p className="price">${product.precio}</p>
        </div>
      )}

      {error && <p className="scanner-error">{error}</p>}
    </div>
  )
}
