// features/BarcodeModule/domain/getProductByBarcode.ts
// domain/getProductByBarcode.ts
import { getProductByBarcode } from "../service/productService"

export async function findProduct(barcode: string) {
  const product = await getProductByBarcode(barcode)

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND")
  }

  return product
}

