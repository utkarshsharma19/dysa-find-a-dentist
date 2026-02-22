const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export interface SessionResponse {
  sessionId: string
  createdAt: string
  matchJobId: string | null
  triage: {
    action: string
    blocked: boolean
    messageTitle?: string
    messageBody?: string
  }
}

export interface MatchJobResponse {
  id: string
  sessionId: string
  status: string
  queuedAt: string
  startedAt: string | null
  completedAt: string | null
  failedAt: string | null
  errorMessage: string | null
}

export async function createSession(body: Record<string, unknown>): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export async function getMatchJobStatus(jobId: string): Promise<MatchJobResponse> {
  const res = await fetch(`${API_BASE}/match-jobs/${jobId}`)

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return res.json()
}
