import type { CandidateClinic, MatchInput } from '../types.js'
import type { ScorerResult } from './types.js'

export function scoreCost(clinic: CandidateClinic, input: MatchInput): ScorerResult {
  const codes: string[] = []
  const isMedicaid =
    input.insuranceType === 'MEDICAID' || input.insuranceType === 'DUAL_MEDICAID_MEDICARE'

  // Medicaid patients: cost is covered
  if (isMedicaid) {
    codes.push('MEDICAID_COVERED')
    return { score: 1.0, reasonCodes: codes }
  }

  const isUninsured = input.insuranceType === 'UNINSURED_SELF_PAY'

  if (!isUninsured) {
    // Private / Medicare / NOT_SURE — assume insurance covers most
    codes.push('INSURANCE_COVERED')
    return { score: 0.8, reasonCodes: codes }
  }

  // Uninsured scoring based on budget band
  const budget = input.budgetBand
  const pricing = clinic.pricingEntries

  // Sliding scale bonus
  if (clinic.accessRules?.slidingScaleAvailable === 'YES') {
    codes.push('SLIDING_SCALE')
  }

  if (pricing.length === 0) {
    const base = 0.5
    const slidingBonus = codes.includes('SLIDING_SCALE') ? 0.2 : 0
    return { score: Math.min(base + slidingBonus, 1.0), reasonCodes: [...codes, 'PRICING_UNKNOWN'] }
  }

  // Find the cheapest available service
  const minPrice = Math.min(...pricing.map((p) => parseFloat(p.priceMin ?? '999')))
  const maxPrice = Math.max(...pricing.map((p) => parseFloat(p.priceMax ?? '0')))

  // Free services
  if (
    minPrice === 0 &&
    (maxPrice === 0 || pricing.some((p) => p.pricingModel === 'DONATION_BASED'))
  ) {
    codes.push('FREE_SERVICES')
    return { score: 1.0, reasonCodes: codes }
  }

  let score: number
  switch (budget) {
    case 'FREE_ONLY':
      score = minPrice === 0 ? 0.8 : 0.1
      if (minPrice === 0) codes.push('HAS_FREE_OPTIONS')
      else codes.push('NOT_FREE')
      break
    case 'UNDER_50':
      score = minPrice <= 50 ? 0.9 : minPrice <= 100 ? 0.5 : 0.2
      break
    case '50_TO_150':
      score = minPrice <= 150 ? 0.9 : minPrice <= 250 ? 0.5 : 0.2
      break
    case '150_PLUS':
      score = 0.8
      break
    default:
      // NOT_SURE or null
      score = minPrice <= 100 ? 0.7 : 0.4
  }

  // Sliding scale bonus
  if (codes.includes('SLIDING_SCALE')) {
    score = Math.min(score + 0.2, 1.0)
  }

  return { score, reasonCodes: codes }
}
