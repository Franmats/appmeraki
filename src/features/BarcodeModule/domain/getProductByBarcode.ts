// domain/getProductByBarcode.ts
import { getProductByBarcode } from "../service/productService"
import { ApiError } from "../service/ApiError"

export async function findProduct(barcode: string) {
  const product = await getProductByBarcode(barcode)
  if (!product) {
    // Caso defensivo (la API respondió 200 pero sin cuerpo útil): lo
    // tratamos igual que un 404 para que la UI lo muestre como "no encontrado".
    throw new ApiError(404, "Producto no encontrado")
  }

  return product
}