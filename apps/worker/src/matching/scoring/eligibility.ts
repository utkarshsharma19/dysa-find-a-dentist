import type { CandidateClinic, MatchInput } from '../types.js'
import type { ScorerResult } from './types.js'

export function scoreEligibility(clinic: CandidateClinic, input: MatchInput): ScorerResult {
  const rules = clinic.accessRules
  if (!rules) return { score: 0.4, reasonCodes: ['ELIGIBILITY_UNKNOWN'] }

  const isMedicaid =
    input.insuranceType === 'MEDICAID' || input.insuranceType === 'DUAL_MEDICAID_MEDICARE'
  const isUninsured = input.insuranceType === 'UNINSURED_SELF_PAY'
  const isMedicare =
    input.insuranceType === 'MEDICARE' || input.insuranceType === 'DUAL_MEDICAID_MEDICARE'

  const codes: string[] = []
  let status: string = 'UNKNOWN'

  if (isMedicaid) {
    status = rules.acceptsMedicaidAdults ?? 'UNKNOWN'

    // Plan match bonus
    const accepted = rules.medicaidPlansAccepted
    if (input.medicaidPlan && input.medicaidPlan !== 'UNSURE' && accepted && accepted.length > 0) {
      if (accepted.includes(input.medicaidPlan)) {
        codes.push('EXACT_PLAN_MATCH')
      }
    }
    if (input.medicaidPlan === 'UNSURE') {
      codes.push('PLAN_UNSURE')
    }
  } else if (isUninsured) {
    status = rules.uninsuredWelcome ?? 'UNKNOWN'
  } else if (isMedicare) {
    const medicareStatus = rules.acceptsMedicare
    status = medicareStatus === 'YES' ? 'YES' : medicareStatus === 'NO' ? 'NO' : 'UNKNOWN'
  } else {
    // PRIVATE or NOT_SURE — generally accepted
    status = 'YES'
    codes.push('PRIVATE_GENERALLY_ACCEPTED')
  }

  let score: number
  switch (status) {
    case 'YES':
      score = codes.includes('PLAN_UNSURE') ? 0.8 : 1.0
      codes.push('ELIGIBLE')
      break
    case 'LIMITED':
      score = 0.6
      codes.push('ELIGIBILITY_LIMITED')
      break
    case 'NO':
      score = 0.0
      codes.push('NOT_ELIGIBLE')
      break
    default:
      score = 0.4
      codes.push('ELIGIBILITY_UNKNOWN')
  }

  return { score, reasonCodes: codes }
}
