// features/BarcodeModule/service/productService.ts
import type { Product } from "../types/Product"

export async function getProductByBarcode(
  barcode: string
): Promise<Product> {
  const res = await fetch(
    `https://router.sgilibra.com:9443/api/products/${barcode}`,
    { credentials: "include" }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || "Producto no encontrado")
  }

  return data as Product
}
