import type { Product } from "../types/Product"
import { ApiError } from "./ApiError"

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
    `${apiUrl}/productos/barras/${barcode}`,

    { credentials: "include", headers: {
      Authorization: `Bearer ${token}`,
    }, }

  )

  const data = await res.json()

  if (!res.ok) {
    // Antes: throw new Error(`${res.status} - ${data?.error || "..."}`)
    // Ahora el status viaja como campo propio (number), no mezclado en el
    // texto, así ningún código de arriba tiene que parsear el mensaje.
    throw new ApiError(res.status, data?.error || "Producto no encontrado")
  }

  return data as Product
}