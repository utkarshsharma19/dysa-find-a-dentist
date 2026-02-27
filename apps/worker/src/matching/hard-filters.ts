import type { CandidateClinic, FilteredClinic, MatchInput, ServiceType } from './types.js'
import { COMPLAINT_SERVICE_MAP } from './complaint-service-map.js'
import { haversineDistanceMiles, travelTimeToRadiusMiles } from './geo.js'

export interface HardFilterResult {
  passed: FilteredClinic[]
  rejected: Array<{ clinicId: string; reasons: string[] }>
}

export function applyHardFilters(
  candidates: CandidateClinic[],
  input: MatchInput,
): HardFilterResult {
  const passed: FilteredClinic[] = []
  const rejected: Array<{ clinicId: string; reasons: string[] }> = []

  for (const clinic of candidates) {
    const reasons = getFilterReasons(clinic, input)
    if (reasons.length === 0) {
      passed.push(clinic)
    } else {
      rejected.push({ clinicId: clinic.id, reasons })
    }
  }

  return { passed, rejected }
}

function getFilterReasons(clinic: CandidateClinic, input: MatchInput): string[] {
  const reasons: string[] = []

  // 1. Inactive clinic
  if (!clinic.active) {
    reasons.push('INACTIVE')
    return reasons
  }

  // 2. No primary service match for complaint
  const mapping = COMPLAINT_SERVICE_MAP[input.chiefComplaint]
  if (!hasAnyPrimaryService(clinic, mapping.primary, input.insuranceType)) {
    reasons.push('NO_PRIMARY_SERVICE')
  }

  // 3. Insurance rejection at clinic level
  const rules = clinic.accessRules
  if (rules) {
    const isMedicaid =
      input.insuranceType === 'MEDICAID' || input.insuranceType === 'DUAL_MEDICAID_MEDICARE'
    const isUninsured = input.insuranceType === 'UNINSURED_SELF_PAY'
    const isMedicare =
      input.insuranceType === 'MEDICARE' || input.insuranceType === 'DUAL_MEDICAID_MEDICARE'

    if (isMedicaid && rules.acceptsMedicaidAdults === 'NO') {
      reasons.push('REJECTS_MEDICAID')
    }
    if (isUninsured && rules.uninsuredWelcome === 'NO') {
      reasons.push('REJECTS_UNINSURED')
    }
    if (isMedicare && rules.acceptsMedicare === 'NO') {
      reasons.push('REJECTS_MEDICARE')
    }

    // 4. Medicaid plan mismatch
    if (isMedicaid && input.medicaidPlan && input.medicaidPlan !== 'UNSURE') {
      const accepted = rules.medicaidPlansAccepted
      if (accepted && accepted.length > 0 && !accepted.includes(input.medicaidPlan)) {
        reasons.push('MEDICAID_PLAN_MISMATCH')
      }
    }
  }

  // 5. Explicit clinic_service_rules rejection
  if (hasExplicitServiceRejection(clinic, mapping.primary, input.insuranceType)) {
    reasons.push('SERVICE_RULE_REJECTION')
  }

  // 6. Distance exceeds radius
  if (input.lat != null && input.lng != null && clinic.lat != null && clinic.lng != null) {
    const maxRadius = travelTimeToRadiusMiles(input.travelMode, input.travelTime)
    const distance = haversineDistanceMiles(input.lat, input.lng, clinic.lat, clinic.lng)
    if (distance > maxRadius) {
      reasons.push('TOO_FAR')
    }
  }

  return reasons
}

function hasAnyPrimaryService(
  clinic: CandidateClinic,
  primaryServices: ServiceType[],
  insuranceType: string,
): boolean {
  if (clinic.services.length === 0) return true // no data = pass

  return primaryServices.some((needed) => {
    const svc = clinic.services.find((s) => s.serviceType === needed)
    if (!svc) return false

    // Check insurance availability flags
    switch (insuranceType) {
      case 'MEDICAID':
      case 'DUAL_MEDICAID_MEDICARE':
        return svc.availableForMedicaid
      case 'UNINSURED_SELF_PAY':
        return svc.availableForUninsured
      case 'PRIVATE':
        return svc.availableForPrivate
      default:
        // MEDICARE, NOT_SURE — be permissive
        return svc.availableForMedicaid || svc.availableForUninsured || svc.availableForPrivate
    }
  })
}

function hasExplicitServiceRejection(
  clinic: CandidateClinic,
  primaryServices: ServiceType[],
  insuranceType: string,
): boolean {
  if (clinic.serviceRules.length === 0) return false

  // Check if ALL primary services have explicit NO rules for this insurance
  const relevantRules = clinic.serviceRules.filter(
    (r) => primaryServices.includes(r.serviceType) && r.insuranceType === insuranceType,
  )

  if (relevantRules.length === 0) return false

  // Only reject if every matched primary service has an explicit NO
  const rejectedPrimary = relevantRules.filter((r) => r.accepts === 'NO')
  const matchedPrimary = primaryServices.filter((s) =>
    clinic.services.some((cs) => cs.serviceType === s),
  )

  return matchedPrimary.length > 0 && rejectedPrimary.length >= matchedPrimary.length
}
