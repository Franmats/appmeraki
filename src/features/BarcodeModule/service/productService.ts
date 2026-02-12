// features/BarcodeModule/service/productService.ts
import type { Product } from "../types/Product"
  const getToken = (): string | null => {
    try {
      const storedToken = window.localStorage.getItem("token");
    
      return storedToken ? JSON.parse(storedToken) : null;
    } catch {
      return null;
    }
  };
export async function getProductByBarcode(
  barcode: string
): Promise<Product> {
  const token = getToken();
   const apiUrl = import.meta.env.VITE_API_URL as string;
  const res = await fetch(
    `${apiUrl}/products/${barcode}`,

    { credentials: "include" , headers: {
            Authorization: `Bearer ${token}`,
          },}
    
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || "Producto no encontrado")
  }

  return data as Product
}
