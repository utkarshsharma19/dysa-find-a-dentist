export interface ScoreBreakdown {
  eligibility: number
  serviceMatch: number
  access: number
  cost: number
  distance: number
  freshness: number
}

export interface ScorerResult {
  score: number
  reasonCodes: string[]
}

export interface ScoredClinic {
  clinicId: string
  totalScore: number
  breakdown: ScoreBreakdown
  reasonCodes: string[]
  bucket?: string
}

export interface Weights {
  eligibility: number
  serviceMatch: number
  access: number
  cost: number
  distance: number
  freshness: number
}
