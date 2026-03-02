'use client'

const TOKEN_KEY = 'dysa-admin-token'
const USER_KEY = 'dysa-admin-user'

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: string
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAuth(token: string, user: AdminUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  // Set cookie flag for Next.js middleware
  document.cookie = 'dysa-admin-session=1; path=/'
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  document.cookie = 'dysa-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export function isAdmin(): boolean {
  const user = getAdminUser()
  return user?.role === 'ADMIN'
}

export function canWrite(): boolean {
  const user = getAdminUser()
  return user?.role === 'ADMIN' || user?.role === 'EDITOR'
}
