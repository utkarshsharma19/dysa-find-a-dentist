'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { whatsupdoc, type AuthUser } from './whatsupdoc'

interface AuthState {
  token: string | null
  user: AuthUser | null
}

interface AuthContextValue extends AuthState {
  loading: boolean
  signup: (body: { name: string; email: string; password: string }) => Promise<AuthUser>
  login: (body: { email: string; password: string }) => Promise<AuthUser>
  logout: () => void
}

const STORAGE_KEY = 'dysa_auth'
const AuthCtx = createContext<AuthContextValue | null>(null)

function readStored(): AuthState {
  if (typeof window === 'undefined') return { token: null, user: null }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthState) : { token: null, user: null }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, user: null })
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(readStored())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (state.token) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    else window.localStorage.removeItem(STORAGE_KEY)
  }, [state, hydrated])

  // Validate stored token once hydrated.
  useEffect(() => {
    if (!hydrated || !state.token) return
    let cancelled = false
    whatsupdoc
      .me(state.token)
      .then((me) => {
        if (!cancelled) setState((s) => ({ ...s, user: me }))
      })
      .catch(() => {
        if (!cancelled) setState({ token: null, user: null })
      })
    return () => {
      cancelled = true
    }
  }, [hydrated, state.token])

  const signup = useCallback<AuthContextValue['signup']>(async (body) => {
    setLoading(true)
    try {
      const res = await whatsupdoc.signup(body)
      setState({ token: res.token, user: res.user })
      return res.user
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback<AuthContextValue['login']>(async (body) => {
    setLoading(true)
    try {
      const res = await whatsupdoc.login(body)
      setState({ token: res.token, user: res.user })
      return res.user
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => setState({ token: null, user: null }), [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, loading, signup, login, logout }),
    [state, loading, signup, login, logout],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
