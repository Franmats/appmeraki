// features/BarcodeModule/service/productService.ts
import type { Product } from "../types/Product"

export async function getProductByBarcode(
  barcode: string
): Promise<Product | null> {
  const res = await fetch(
    `https://router.sgilibra.com:9443/api/products/${(barcode)}`,
    { credentials: "include" }
  )

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error("Error al buscar producto")
  }

  return res.json()
}
