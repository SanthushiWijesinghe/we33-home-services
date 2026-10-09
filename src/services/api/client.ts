import { environment } from '../../config/environment'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export type ApiOptions = RequestInit & { token?: string }

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  if (!environment.apiUrl) throw new ApiError(0, 'VITE_API_URL is not configured')
  const { token, headers, ...request } = options
  const response = await fetch(`${environment.apiUrl}/${path.replace(/^\/+/, '')}`, {
    ...request,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, body?.error?.message ?? 'Request failed')
  return body as T
}
