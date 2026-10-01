// Error tipado que viaja desde el fetch hasta la UI con el status HTTP real,
// para no tener que adivinar "no encontrado" vs "error real" por texto.
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}