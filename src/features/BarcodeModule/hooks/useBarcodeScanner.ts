// features/BarcodeModule/hooks/useBarcodeScanner.ts
import { useState } from "react"
import { findProduct } from "../domain/getProductByBarcode"
import type { Product } from "../types/Product"

export function useBarcodeScanner() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchByBarcode = async (barcode: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await findProduct(barcode)
      setProduct(result)
    } catch (e) {
      setError("No se pudo buscar el producto")
    } finally {
      setLoading(false)
    }
  }

  return { product, loading, error, searchByBarcode }
}
