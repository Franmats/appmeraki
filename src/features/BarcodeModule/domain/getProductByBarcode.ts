// features/BarcodeModule/domain/getProductByBarcode.ts
import { getProductByBarcode } from "../service/productService"

export async function findProduct(barcode: string) {
  if (!barcode) throw new Error("Código inválido")
  return getProductByBarcode(barcode)
}
