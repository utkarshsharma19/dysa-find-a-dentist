import type { CandidateClinic, MatchInput } from '../types.js'
import type { ScorerResult } from './types.js'

export function scoreAccess(clinic: CandidateClinic, input: MatchInput): ScorerResult {
  const codes: string[] = []
  let score = 0.5

  const rules = clinic.accessRules
  const timing = clinic.accessTimingEntries

  // Walk-in scoring based on urgency
  if (rules?.walkInAllowed === 'YES') {
    codes.push('WALK_IN_AVAILABLE')
    if (input.urgency === 'TODAY') {
      score = 1.0
    } else {
      score = 0.8
    }
  } else if (rules?.walkInAllowed === 'LIMITED') {
    codes.push('WALK_IN_LIMITED')
    score = input.urgency === 'TODAY' ? 0.7 : 0.6
  }

  // Wait time scoring from access timing
  if (timing.length > 0) {
    const relevant = timing.find((t) => t.nextAvailableDaysEstimate != null)
    if (relevant?.nextAvailableDaysEstimate != null) {
      const days = relevant.nextAvailableDaysEstimate
      const waitScore = getWaitScore(days, input.urgency)

      // Take the better of walk-in score or wait-based score
      if (waitScore > score) {
        score = waitScore
      }

      if (days === 0) codes.push('SAME_DAY_AVAILABLE')
      else if (days <= 3) codes.push('SHORT_WAIT')
      else if (days <= 14) codes.push('MODERATE_WAIT')
      else codes.push('LONG_WAIT')
    }
  }

  // Referral penalty
  if (rules?.referralRequired === 'YES') {
    score *= 0.7
    codes.push('REFERRAL_REQUIRED')
  }

  // Urgency flattening for JUST_EXPLORING
  if (input.urgency === 'JUST_EXPLORING') {
    score = 0.7 + score * 0.3 // flatten to 0.7–1.0 range
  }

  return { score: Math.min(score, 1.0), reasonCodes: codes }
}

function getWaitScore(days: number, urgency: string): number {
  switch (urgency) {
    case 'TODAY':
      if (days === 0) return 1.0
      if (days <= 1) return 0.6
      return 0.2
    case 'WITHIN_3_DAYS':
      if (days <= 1) return 1.0
      if (days <= 3) return 0.8
      if (days <= 7) return 0.5
      return 0.3
    case 'WITHIN_2_WEEKS':
      if (days <= 3) return 1.0
      if (days <= 14) return 0.8
      if (days <= 30) return 0.5
      return 0.3
    default: // JUST_EXPLORING
      if (days <= 7) return 1.0
      if (days <= 30) return 0.8
      return 0.6
  }
}
