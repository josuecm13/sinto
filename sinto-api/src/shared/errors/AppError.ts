/**
 * MODULE: AppError
 * Domain error class. Throw this anywhere to produce a structured JSON error response via the global error handler.
 *
 * Exports: AppError
 */

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
