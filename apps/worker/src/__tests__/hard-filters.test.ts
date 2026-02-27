import { describe, it, expect } from 'vitest'
import { applyHardFilters } from '../matching/hard-filters.js'
import type { CandidateClinic, MatchInput } from '../matching/types.js'

function makeClinic(overrides: Partial<CandidateClinic> = {}): CandidateClinic {
  return {
    id: 'clinic-1',
    name: 'Test Clinic',
    clinicType: 'FQHC',
    active: true,
    services: [
      {
        serviceType: 'EXAM',
        availableForMedicaid: true,
        availableForUninsured: true,
        availableForPrivate: true,
        newPatientsAccepted: true,
      },
      {
        serviceType: 'EMERGENCY_VISIT',
        availableForMedicaid: true,
        availableForUninsured: true,
        availableForPrivate: true,
        newPatientsAccepted: true,
      },
      {
        serviceType: 'CLEANING',
        availableForMedicaid: true,
        availableForUninsured: true,
        availableForPrivate: true,
        newPatientsAccepted: true,
      },
    ],
    serviceRules: [],
    pricingEntries: [],
    accessTimingEntries: [],
    accessRules: {
      acceptsMedicaidAdults: 'YES',
      acceptsMedicare: 'YES',
      uninsuredWelcome: 'YES',
      medicaidPlansAccepted: [],
      slidingScaleAvailable: 'YES',
      walkInAllowed: 'YES',
      referralRequired: 'NO',
      seesEmergencyPain: 'YES',
      seesSwelling: 'YES',
    },
    ...overrides,
  }
}

function makeInput(overrides: Partial<MatchInput> = {}): MatchInput {
  return {
    sessionId: 'session-1',
    chiefComplaint: 'PAIN',
    insuranceType: 'MEDICAID',
    urgency: 'TODAY',
    ...overrides,
  }
}

describe('applyHardFilters', () => {
  it('passes an active clinic with matching services', () => {
    const result = applyHardFilters([makeClinic()], makeInput())
    expect(result.passed).toHaveLength(1)
    expect(result.rejected).toHaveLength(0)
  })

  it('rejects inactive clinic', () => {
    const result = applyHardFilters([makeClinic({ active: false })], makeInput())
    expect(result.passed).toHaveLength(0)
    expect(result.rejected[0].reasons).toContain('INACTIVE')
  })

  it('rejects clinic with no matching primary service', () => {
    const clinic = makeClinic({
      services: [
        {
          serviceType: 'CLEANING',
          availableForMedicaid: true,
          availableForUninsured: true,
          availableForPrivate: true,
          newPatientsAccepted: true,
        },
      ],
    })
    // PAIN needs EMERGENCY_VISIT or EXAM
    const result = applyHardFilters([clinic], makeInput())
    expect(result.rejected[0].reasons).toContain('NO_PRIMARY_SERVICE')
  })

  it('rejects clinic that rejects Medicaid', () => {
    const clinic = makeClinic({
      accessRules: {
        acceptsMedicaidAdults: 'NO',
        acceptsMedicare: 'YES',
        uninsuredWelcome: 'YES',
        medicaidPlansAccepted: [],
      },
    })
    const result = applyHardFilters([clinic], makeInput({ insuranceType: 'MEDICAID' }))
    expect(result.rejected[0].reasons).toContain('REJECTS_MEDICAID')
  })

  it('rejects clinic that rejects uninsured', () => {
    const clinic = makeClinic({
      accessRules: {
        acceptsMedicaidAdults: 'YES',
        acceptsMedicare: 'YES',
        uninsuredWelcome: 'NO',
        medicaidPlansAccepted: [],
      },
    })
    const result = applyHardFilters([clinic], makeInput({ insuranceType: 'UNINSURED_SELF_PAY' }))
    expect(result.rejected[0].reasons).toContain('REJECTS_UNINSURED')
  })

  it('rejects clinic with Medicaid plan mismatch', () => {
    const clinic = makeClinic({
      accessRules: {
        acceptsMedicaidAdults: 'YES',
        acceptsMedicare: 'YES',
        uninsuredWelcome: 'YES',
        medicaidPlansAccepted: ['PRIORITY_PARTNERS', 'AMERIGROUP'],
      },
    })
    const result = applyHardFilters(
      [clinic],
      makeInput({ insuranceType: 'MEDICAID', medicaidPlan: 'JAI_MEDICAL' }),
    )
    expect(result.rejected[0].reasons).toContain('MEDICAID_PLAN_MISMATCH')
  })

  it('passes clinic when patient Medicaid plan is UNSURE', () => {
    const clinic = makeClinic({
      accessRules: {
        acceptsMedicaidAdults: 'YES',
        acceptsMedicare: 'YES',
        uninsuredWelcome: 'YES',
        medicaidPlansAccepted: ['PRIORITY_PARTNERS'],
      },
    })
    const result = applyHardFilters(
      [clinic],
      makeInput({ insuranceType: 'MEDICAID', medicaidPlan: 'UNSURE' }),
    )
    expect(result.passed).toHaveLength(1)
  })

  it('passes clinic when medicaidPlansAccepted is empty (accepts all)', () => {
    const clinic = makeClinic({
      accessRules: {
        acceptsMedicaidAdults: 'YES',
        acceptsMedicare: 'YES',
        uninsuredWelcome: 'YES',
        medicaidPlansAccepted: [],
      },
    })
    const result = applyHardFilters(
      [clinic],
      makeInput({ insuranceType: 'MEDICAID', medicaidPlan: 'JAI_MEDICAL' }),
    )
    expect(result.passed).toHaveLength(1)
  })

  it('rejects clinic too far away', () => {
    const clinic = makeClinic({ lat: 38.36, lng: -75.6 }) // Salisbury
    const input = makeInput({
      lat: 39.29,
      lng: -76.61, // Baltimore
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_30_MIN',
    })
    const result = applyHardFilters([clinic], input)
    expect(result.rejected[0].reasons).toContain('TOO_FAR')
  })

  it('passes clinic with no coordinates (distance unknown)', () => {
    const clinic = makeClinic({ lat: null, lng: null })
    const input = makeInput({
      lat: 39.29,
      lng: -76.61,
      travelMode: 'WALK_ONLY',
      travelTime: 'UP_TO_15_MIN',
    })
    const result = applyHardFilters([clinic], input)
    expect(result.passed).toHaveLength(1)
  })

  it('passes clinic when patient has no coordinates', () => {
    const clinic = makeClinic({ lat: 38.36, lng: -75.6 })
    const input = makeInput({ lat: null, lng: null })
    const result = applyHardFilters([clinic], input)
    expect(result.passed).toHaveLength(1)
  })

  it('rejects Medicare patient at clinic rejecting Medicare', () => {
    const clinic = makeClinic({
      accessRules: {
        acceptsMedicaidAdults: 'YES',
        acceptsMedicare: 'NO',
        uninsuredWelcome: 'YES',
        medicaidPlansAccepted: [],
      },
    })
    const result = applyHardFilters([clinic], makeInput({ insuranceType: 'MEDICARE' }))
    expect(result.rejected[0].reasons).toContain('REJECTS_MEDICARE')
  })

  it('filters multiple clinics correctly', () => {
    const clinics = [
      makeClinic({ id: 'good', active: true }),
      makeClinic({ id: 'inactive', active: false }),
      makeClinic({
        id: 'no-service',
        services: [
          {
            serviceType: 'DENTURE_FULL',
            availableForMedicaid: true,
            availableForUninsured: true,
            availableForPrivate: true,
            newPatientsAccepted: true,
          },
        ],
      }),
    ]
    const result = applyHardFilters(clinics, makeInput())
    expect(result.passed).toHaveLength(1)
    expect(result.passed[0].id).toBe('good')
    expect(result.rejected).toHaveLength(2)
  })
})
