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
  const text = await res.text()
 

  if (!res.ok) {

   
  throw new Error(`${res.status} | ${text.substring(0, 100)}`)
/*     const token = getToken()
throw new Error(`${res.status} - token: "${token?.substring(0, 30)}..."`) */
/*   throw new Error(`${res.status} - ${data?.error || "Producto no encontrado"}`) */
}
   const data = await res.json()
  return data as Product
}
