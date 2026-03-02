import { getToken, clearAuth } from './admin-auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    clearAuth()
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}

// Auth
export async function adminLogin(email: string, password: string) {
  return adminFetch<{
    token: string
    user: { id: string; email: string; displayName: string; role: string }
  }>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function adminGetMe() {
  return adminFetch<{
    user: { id: string; email: string; displayName: string; role: string }
  }>('/admin/auth/me')
}

// Clinics
export interface ClinicListItem {
  id: string
  name: string
  clinicType: string
  city: string | null
  county: string | null
  active: boolean
  lastVerifiedAt: string | null
}

export interface ClinicDetail {
  id: string
  name: string
  clinicType: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  county: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  phoneSecondary: string | null
  websiteUrl: string | null
  intakeUrl: string | null
  active: boolean
  languagesAvailable: string[] | null
  adaAccessible: string | null
  parkingAvailable: string | null
  nearTransitStop: boolean | null
  lastVerifiedAt: string | null
  verificationConfidence: string | null
  notesInternal: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export async function listClinics(params?: {
  page?: number
  pageSize?: number
  search?: string
  active?: boolean
}) {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.pageSize) query.set('pageSize', String(params.pageSize))
  if (params?.search) query.set('search', params.search)
  if (params?.active !== undefined) query.set('active', String(params.active))
  const qs = query.toString()
  return adminFetch<PaginatedResponse<ClinicListItem>>(`/admin/clinics${qs ? `?${qs}` : ''}`)
}

export async function getClinic(id: string) {
  return adminFetch<{ clinic: ClinicDetail }>(`/admin/clinics/${id}`)
}

export async function updateClinic(id: string, data: Partial<ClinicDetail>) {
  return adminFetch<{ clinic: ClinicDetail }>(`/admin/clinics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function createClinic(data: Partial<ClinicDetail>) {
  return adminFetch<{ clinic: ClinicDetail }>('/admin/clinics', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Generic sub-entity CRUD
export async function listSubEntity<T>(clinicId: string, entity: string) {
  return adminFetch<{ data: T[] }>(`/admin/clinics/${clinicId}/${entity}`)
}

export async function updateSubEntity<T>(clinicId: string, entity: string, data: T[]) {
  return adminFetch<{ data: T[] }>(`/admin/clinics/${clinicId}/${entity}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  })
}
