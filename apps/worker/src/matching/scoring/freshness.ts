import type { CandidateClinic } from '../types.js'
import type { ScorerResult } from './types.js'

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_FRESHNESS_DAYS = 180
const STALE_THRESHOLD_DAYS = 365

export function scoreFreshness(clinic: CandidateClinic): ScorerResult {
  const codes: string[] = []
  const now = Date.now()

  // Collect all lastVerifiedAt timestamps
  const timestamps: number[] = []

  if (clinic.lastVerifiedAt) timestamps.push(clinic.lastVerifiedAt.getTime())
  if (clinic.accessRules?.lastVerifiedAt)
    timestamps.push(clinic.accessRules.lastVerifiedAt.getTime())
  for (const s of clinic.services) {
    if (s.lastVerifiedAt) timestamps.push(s.lastVerifiedAt.getTime())
  }
  for (const p of clinic.pricingEntries) {
    if (p.lastVerifiedAt) timestamps.push(p.lastVerifiedAt.getTime())
  }

  if (timestamps.length === 0) {
    codes.push('NO_VERIFICATION_DATA')
    return { score: 0.3, reasonCodes: codes }
  }

  // Primary score: linear decay based on most recent verification
  const mostRecent = Math.max(...timestamps)
  const daysSinceRecent = (now - mostRecent) / DAY_MS
  let score = Math.max(0, 1 - daysSinceRecent / MAX_FRESHNESS_DAYS)

  if (daysSinceRecent <= 30) codes.push('RECENTLY_VERIFIED')
  else if (daysSinceRecent <= 90) codes.push('MODERATELY_FRESH')
  else codes.push('VERIFICATION_AGING')

  // Stale penalty: if oldest timestamp > 365 days
  const oldest = Math.min(...timestamps)
  const daysSinceOldest = (now - oldest) / DAY_MS
  if (daysSinceOldest > STALE_THRESHOLD_DAYS) {
    score = Math.max(0, score - 0.2)
    codes.push('STALE_DATA_PENALTY')
  }

  return { score: Math.min(score, 1.0), reasonCodes: codes }
}
