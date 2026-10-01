// features/BarcodeModule/hooks/useBarcodeScanner.ts
import { useState } from "react"
import { findProduct } from "../domain/getProductByBarcode"
import { ApiError } from "../service/ApiError"
import type { Product } from "../types/Product"

export function useBarcodeScanner() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // true solo cuando el backend respondió 404 (código leído pero el
  // producto no existe en el sistema). Cualquier otro status (500, red
  // caída, etc.) deja esto en false y usa el mensaje real en `error`.
  const [notFound, setNotFound] = useState(false)

  const searchByBarcode = async (barcode: string) => {
    setLoading(true)
    setError(null)
    setProduct(null)
    setNotFound(false)

    try {
      const result = await findProduct(barcode)
      setProduct(result)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNotFound(true)
        setError("Producto no encontrado en el sistema")
      } else if (e instanceof Error) {
        setError(e.message) // ← muestra el mensaje real en pantalla
      } else {
        setError(String(e))
      }
    } finally {
      setLoading(false)
    }
  }

  return { product, loading, error, notFound, searchByBarcode }
}