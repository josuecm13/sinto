/**
 * MODULE: Typed HTTP Client
 * Wraps fetch with auth header and throws ApiError on non-2xx responses.
 *
 * Exports: apiGet, apiPost, apiPatch, apiDelete, ApiError
 * Depends on: fetch (Node 18+), BASE_URL env
 */
const BASE_URL = process.env.SINTO_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function authHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as Record<string, unknown>
  if (!res.ok) {
    throw new ApiError(
      (data.error as string) ?? 'UNKNOWN_ERROR',
      (data.message as string) ?? 'An error occurred',
      res.status,
    )
  }
  return data as T
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  return handleResponse<T>(res)
}

export async function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiDelete(path: string, token?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const data = (await res.json()) as Record<string, unknown>
    throw new ApiError(
      (data.error as string) ?? 'UNKNOWN_ERROR',
      (data.message as string) ?? 'An error occurred',
      res.status,
    )
  }
}
