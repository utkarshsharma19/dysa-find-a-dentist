import type { CandidateClinic, MatchInput } from '../types.js'
import type { ScoredClinic } from './types.js'
import { getWeights } from './weights.js'
import { scoreEligibility } from './eligibility.js'
import { scoreServiceMatch } from './service-match.js'
import { scoreAccess } from './access.js'
import { scoreCost } from './cost.js'
import { scoreDistance } from './distance.js'
import { scoreFreshness } from './freshness.js'

export function scoreClinic(clinic: CandidateClinic, input: MatchInput): ScoredClinic {
  const weights = getWeights()

  const eligibility = scoreEligibility(clinic, input)
  const serviceMatch = scoreServiceMatch(clinic, input)
  const access = scoreAccess(clinic, input)
  const cost = scoreCost(clinic, input)
  const distance = scoreDistance(clinic, input)
  const freshness = scoreFreshness(clinic)

  const breakdown = {
    eligibility: eligibility.score,
    serviceMatch: serviceMatch.score,
    access: access.score,
    cost: cost.score,
    distance: distance.score,
    freshness: freshness.score,
  }

  const totalScore =
    breakdown.eligibility * weights.eligibility +
    breakdown.serviceMatch * weights.serviceMatch +
    breakdown.access * weights.access +
    breakdown.cost * weights.cost +
    breakdown.distance * weights.distance +
    breakdown.freshness * weights.freshness

  const reasonCodes = [
    ...eligibility.reasonCodes,
    ...serviceMatch.reasonCodes,
    ...access.reasonCodes,
    ...cost.reasonCodes,
    ...distance.reasonCodes,
    ...freshness.reasonCodes,
  ]

  return {
    clinicId: clinic.id,
    totalScore,
    breakdown,
    reasonCodes,
  }
}
