import type { ScoredClinic } from './scoring/types.js'

const BEST_MATCH_THRESHOLD = 0.7
const GOOD_MATCH_THRESHOLD = 0.45

const UNKNOWN_CODES = [
  'ELIGIBILITY_UNKNOWN',
  'DISTANCE_UNKNOWN',
  'PRICING_UNKNOWN',
  'SERVICE_DATA_MISSING',
  'NO_VERIFICATION_DATA',
]

export function assignBuckets(scored: ScoredClinic[]): ScoredClinic[] {
  return scored.map((clinic) => ({
    ...clinic,
    bucket: getBucket(clinic.totalScore),
  }))
}

function getBucket(score: number): string {
  if (score >= BEST_MATCH_THRESHOLD) return 'BEST_MATCH'
  if (score >= GOOD_MATCH_THRESHOLD) return 'GOOD_MATCH'
  return 'OTHER_OPTIONS'
}

export function computeDisplayConfidence(reasonCodes: string[]): string {
  const unknownCount = reasonCodes.filter((c) => UNKNOWN_CODES.includes(c)).length
  if (unknownCount === 0) return 'HIGH'
  if (unknownCount <= 2) return 'MEDIUM'
  return 'LOW'
}
