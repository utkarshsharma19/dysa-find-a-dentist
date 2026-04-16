/**
 * Client for the WhatsUpDoc FastAPI backend (auth + AI booking chat).
 * Served separately from the Fastify `@dysa/api` — point NEXT_PUBLIC_WHATSUPDOC_URL
 * at e.g. http://localhost:8001/api
 */

const BASE = process.env.NEXT_PUBLIC_WHATSUPDOC_URL ?? 'http://localhost:8001/api'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface ChatReply {
  session_id: string
  replies: string[]
}

export class WhatsUpDocError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  }
  if (token) h.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...rest, headers: h })
  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : null
  if (!res.ok) {
    const obj = data as { detail?: string; message?: string } | null
    const msg = obj?.detail || obj?.message || `Request failed (${res.status})`
    throw new WhatsUpDocError(msg, res.status)
  }
  return data as T
}

export const whatsupdoc = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: (token: string) => request<AuthUser>('/auth/me', { token }),

  chat: (
    token: string,
    body: {
      message: string
      session_id?: string
      context?: Record<string, unknown>
    },
  ) => request<ChatReply>('/chat', { method: 'POST', token, body: JSON.stringify(body) }),
}
