import type { CandidateClinic, MatchInput, ServiceType } from '../types.js'
import { COMPLAINT_SERVICE_MAP } from '../complaint-service-map.js'
import type { ScorerResult } from './types.js'

export function scoreServiceMatch(clinic: CandidateClinic, input: MatchInput): ScorerResult {
  const mapping = COMPLAINT_SERVICE_MAP[input.chiefComplaint]
  const codes: string[] = []

  if (clinic.services.length === 0) {
    return { score: 0.5, reasonCodes: ['SERVICE_DATA_MISSING'] }
  }

  // Count primary service matches
  const matchedPrimary = mapping.primary.filter((s) =>
    isServiceAvailable(clinic, s, input.insuranceType),
  )
  const primaryScore =
    mapping.primary.length > 0 ? matchedPrimary.length / mapping.primary.length : 0

  if (matchedPrimary.length === mapping.primary.length) {
    codes.push('ALL_PRIMARY_SERVICES')
  } else if (matchedPrimary.length > 0) {
    codes.push('PARTIAL_PRIMARY_SERVICES')
  }

  // Secondary bonus: 0.1 per match, capped at 0.3
  const matchedSecondary = mapping.secondary.filter((s) =>
    isServiceAvailable(clinic, s, input.insuranceType),
  )
  const secondaryBonus = Math.min(matchedSecondary.length * 0.1, 0.3)

  if (matchedSecondary.length > 0) {
    codes.push('HAS_SECONDARY_SERVICES')
  }

  const score = Math.min(primaryScore + secondaryBonus, 1.0)
  return { score, reasonCodes: codes }
}

function isServiceAvailable(
  clinic: CandidateClinic,
  serviceType: ServiceType,
  insuranceType: string,
): boolean {
  const svc = clinic.services.find((s) => s.serviceType === serviceType)
  if (!svc) return false

  switch (insuranceType) {
    case 'MEDICAID':
    case 'DUAL_MEDICAID_MEDICARE':
      return svc.availableForMedicaid
    case 'UNINSURED_SELF_PAY':
      return svc.availableForUninsured
    case 'PRIVATE':
      return svc.availableForPrivate
    default:
      return svc.availableForMedicaid || svc.availableForUninsured || svc.availableForPrivate
  }
}
