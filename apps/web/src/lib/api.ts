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

export interface RecommendationItem {
  id: string
  sessionId: string
  clinicId: string
  rank: number
  bucket: string
  scoreTotal: string | null
  scoreEligibility: string | null
  scoreServiceMatch: string | null
  scoreAccess: string | null
  scoreCost: string | null
  scoreDistance: string | null
  scoreFreshness: string | null
  reasonCodes: string[] | null
  displayConfidence: string | null
  createdAt: string
  clinicName: string
  clinicType: string
  clinicAddress: string | null
  clinicCity: string | null
  clinicState: string | null
  clinicZip: string | null
  clinicCounty: string | null
  clinicPhone: string | null
  clinicWebsiteUrl: string | null
  clinicLanguages: string[] | null
  clinicAdaAccessible: string | null
  clinicParkingAvailable: string | null
  clinicNearTransitStop: boolean | null
}

export interface RecommendationsResponse {
  recommendations: RecommendationItem[]
}

export async function getRecommendations(sessionId: string): Promise<RecommendationsResponse> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/recommendations`)

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
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
