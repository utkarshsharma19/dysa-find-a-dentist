import type { CandidateClinic, MatchInput } from '../types.js'
import { haversineDistanceMiles, travelTimeToRadiusMiles } from '../geo.js'
import type { ScorerResult } from './types.js'

export function scoreDistance(clinic: CandidateClinic, input: MatchInput): ScorerResult {
  const codes: string[] = []

  // No coordinates available
  if (input.lat == null || input.lng == null || clinic.lat == null || clinic.lng == null) {
    codes.push('DISTANCE_UNKNOWN')
    return { score: 0.5, reasonCodes: codes }
  }

  const maxRadius = travelTimeToRadiusMiles(input.travelMode, input.travelTime)
  const distance = haversineDistanceMiles(input.lat, input.lng, clinic.lat, clinic.lng)

  // Linear decay
  const score = Math.max(0, 1 - distance / maxRadius)

  if (distance <= 5) codes.push('VERY_CLOSE')
  else if (distance <= 15) codes.push('NEARBY')
  else if (distance <= 30) codes.push('MODERATE_DISTANCE')
  else codes.push('FAR')

  // Transit bonus
  if (input.travelMode === 'PUBLIC_TRANSIT' && clinic.nearTransitStop) {
    codes.push('NEAR_TRANSIT')
  }

  return { score: Math.min(score, 1.0), reasonCodes: codes }
}
