import { describe, it, expect } from 'vitest'
import { scoreClinic } from '../matching/scoring/index.js'
import { scoreEligibility } from '../matching/scoring/eligibility.js'
import { scoreServiceMatch } from '../matching/scoring/service-match.js'
import { scoreAccess } from '../matching/scoring/access.js'
import { scoreCost } from '../matching/scoring/cost.js'
import { scoreDistance } from '../matching/scoring/distance.js'
import { scoreFreshness } from '../matching/scoring/freshness.js'
import { assignBuckets, computeDisplayConfidence } from '../matching/bucketing.js'
import type { CandidateClinic, MatchInput } from '../matching/types.js'

const recentDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)

function makeClinic(overrides: Partial<CandidateClinic> = {}): CandidateClinic {
  return {
    id: 'test-clinic',
    name: 'Test Clinic',
    clinicType: 'FQHC',
    active: true,
    lat: 39.29,
    lng: -76.61,
    lastVerifiedAt: recentDate,
    services: [
      {
        serviceType: 'EXAM',
        availableForMedicaid: true,
        availableForUninsured: true,
        availableForPrivate: true,
        newPatientsAccepted: true,
        lastVerifiedAt: recentDate,
      },
      {
        serviceType: 'EMERGENCY_VISIT',
        availableForMedicaid: true,
        availableForUninsured: true,
        availableForPrivate: true,
        newPatientsAccepted: true,
        lastVerifiedAt: recentDate,
      },
      {
        serviceType: 'CLEANING',
        availableForMedicaid: true,
        availableForUninsured: true,
        availableForPrivate: true,
        newPatientsAccepted: true,
        lastVerifiedAt: recentDate,
      },
      {
        serviceType: 'XRAY',
        availableForMedicaid: true,
        availableForUninsured: true,
        availableForPrivate: true,
        newPatientsAccepted: true,
        lastVerifiedAt: recentDate,
      },
      {
        serviceType: 'FILLING',
        availableForMedicaid: true,
        availableForUninsured: true,
        availableForPrivate: true,
        newPatientsAccepted: true,
        lastVerifiedAt: recentDate,
      },
    ],
    serviceRules: [],
    pricingEntries: [
      {
        serviceType: 'EXAM',
        priceMin: '0',
        priceMax: '40',
        pricingModel: 'SLIDING_SCALE',
        lastVerifiedAt: recentDate,
      },
    ],
    accessTimingEntries: [
      { serviceType: 'EMERGENCY_VISIT', insuranceType: null, nextAvailableDaysEstimate: 0 },
    ],
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
    lat: 39.29,
    lng: -76.61,
    travelMode: 'DRIVES',
    travelTime: 'UP_TO_30_MIN',
    ...overrides,
  }
}

describe('scoreEligibility', () => {
  it('scores YES Medicaid as 1.0', () => {
    const result = scoreEligibility(makeClinic(), makeInput())
    expect(result.score).toBe(1.0)
    expect(result.reasonCodes).toContain('ELIGIBLE')
  })

  it('scores UNKNOWN eligibility as 0.4', () => {
    const result = scoreEligibility(makeClinic({ accessRules: null }), makeInput())
    expect(result.score).toBe(0.4)
    expect(result.reasonCodes).toContain('ELIGIBILITY_UNKNOWN')
  })

  it('scores Medicaid with UNSURE plan as 0.8', () => {
    const result = scoreEligibility(makeClinic(), makeInput({ medicaidPlan: 'UNSURE' }))
    expect(result.score).toBe(0.8)
    expect(result.reasonCodes).toContain('PLAN_UNSURE')
  })
})

describe('scoreServiceMatch', () => {
  it('scores full primary match as 1.0', () => {
    // PAIN primary: EMERGENCY_VISIT, EXAM — both available
    const result = scoreServiceMatch(makeClinic(), makeInput())
    expect(result.score).toBeGreaterThanOrEqual(1.0)
    expect(result.reasonCodes).toContain('ALL_PRIMARY_SERVICES')
  })

  it('scores partial match lower', () => {
    const clinic = makeClinic({
      services: [
        {
          serviceType: 'EXAM',
          availableForMedicaid: true,
          availableForUninsured: true,
          availableForPrivate: true,
          newPatientsAccepted: true,
        },
      ],
    })
    const result = scoreServiceMatch(clinic, makeInput())
    expect(result.score).toBeLessThan(1.0)
    expect(result.score).toBeGreaterThan(0)
  })
})

describe('scoreAccess', () => {
  it('scores walk-in + TODAY as high', () => {
    const result = scoreAccess(makeClinic(), makeInput({ urgency: 'TODAY' }))
    expect(result.score).toBeGreaterThanOrEqual(0.8)
  })

  it('penalizes referral required', () => {
    const clinic = makeClinic({
      accessRules: {
        ...makeClinic().accessRules!,
        referralRequired: 'YES',
        walkInAllowed: 'NO',
      },
    })
    const result = scoreAccess(clinic, makeInput())
    expect(result.reasonCodes).toContain('REFERRAL_REQUIRED')
  })
})

describe('scoreCost', () => {
  it('scores Medicaid as 1.0', () => {
    const result = scoreCost(makeClinic(), makeInput({ insuranceType: 'MEDICAID' }))
    expect(result.score).toBe(1.0)
  })

  it('scores free clinic for uninsured FREE_ONLY high', () => {
    const clinic = makeClinic({
      pricingEntries: [
        { serviceType: 'EXAM', priceMin: '0', priceMax: '0', pricingModel: 'DONATION_BASED' },
      ],
    })
    const result = scoreCost(
      clinic,
      makeInput({ insuranceType: 'UNINSURED_SELF_PAY', budgetBand: 'FREE_ONLY' }),
    )
    expect(result.score).toBe(1.0)
  })
})

describe('scoreDistance', () => {
  it('scores same location as ~1.0', () => {
    const result = scoreDistance(
      makeClinic({ lat: 39.29, lng: -76.61 }),
      makeInput({ lat: 39.29, lng: -76.61 }),
    )
    expect(result.score).toBeGreaterThanOrEqual(0.95)
  })

  it('scores unknown distance as 0.5', () => {
    const result = scoreDistance(makeClinic({ lat: null, lng: null }), makeInput())
    expect(result.score).toBe(0.5)
    expect(result.reasonCodes).toContain('DISTANCE_UNKNOWN')
  })
})

describe('scoreFreshness', () => {
  it('scores recently verified as high', () => {
    const result = scoreFreshness(makeClinic())
    expect(result.score).toBeGreaterThan(0.7)
    expect(result.reasonCodes).toContain('RECENTLY_VERIFIED')
  })

  it('scores no verification data as 0.3', () => {
    const clinic = makeClinic({
      lastVerifiedAt: null,
      accessRules: { ...makeClinic().accessRules!, lastVerifiedAt: undefined },
      services: makeClinic().services.map((s) => ({ ...s, lastVerifiedAt: undefined })),
      pricingEntries: [],
    })
    const result = scoreFreshness(clinic)
    expect(result.score).toBe(0.3)
    expect(result.reasonCodes).toContain('NO_VERIFICATION_DATA')
  })
})

describe('scoreClinic (integration)', () => {
  it('produces a total score between 0 and 1', () => {
    const result = scoreClinic(makeClinic(), makeInput())
    expect(result.totalScore).toBeGreaterThan(0)
    expect(result.totalScore).toBeLessThanOrEqual(1)
  })

  it('high-quality clinic scores above 0.7', () => {
    const result = scoreClinic(makeClinic(), makeInput())
    expect(result.totalScore).toBeGreaterThan(0.7)
  })
})

describe('assignBuckets', () => {
  it('assigns BEST_MATCH for score >= 0.70', () => {
    const result = assignBuckets([
      {
        clinicId: 'a',
        totalScore: 0.85,
        breakdown: {
          eligibility: 1,
          serviceMatch: 1,
          access: 1,
          cost: 1,
          distance: 0.5,
          freshness: 0.5,
        },
        reasonCodes: [],
      },
    ])
    expect(result[0].bucket).toBe('BEST_MATCH')
  })

  it('assigns GOOD_MATCH for score >= 0.45', () => {
    const result = assignBuckets([
      {
        clinicId: 'a',
        totalScore: 0.55,
        breakdown: {
          eligibility: 1,
          serviceMatch: 1,
          access: 1,
          cost: 1,
          distance: 0.5,
          freshness: 0.5,
        },
        reasonCodes: [],
      },
    ])
    expect(result[0].bucket).toBe('GOOD_MATCH')
  })

  it('assigns OTHER_OPTIONS for low score', () => {
    const result = assignBuckets([
      {
        clinicId: 'a',
        totalScore: 0.3,
        breakdown: {
          eligibility: 1,
          serviceMatch: 1,
          access: 1,
          cost: 1,
          distance: 0.5,
          freshness: 0.5,
        },
        reasonCodes: [],
      },
    ])
    expect(result[0].bucket).toBe('OTHER_OPTIONS')
  })
})

describe('computeDisplayConfidence', () => {
  it('returns HIGH with no unknowns', () => {
    expect(computeDisplayConfidence(['ELIGIBLE', 'ALL_PRIMARY_SERVICES'])).toBe('HIGH')
  })

  it('returns MEDIUM with 1-2 unknowns', () => {
    expect(computeDisplayConfidence(['ELIGIBILITY_UNKNOWN', 'DISTANCE_UNKNOWN'])).toBe('MEDIUM')
  })

  it('returns LOW with 3+ unknowns', () => {
    expect(
      computeDisplayConfidence(['ELIGIBILITY_UNKNOWN', 'DISTANCE_UNKNOWN', 'PRICING_UNKNOWN']),
    ).toBe('LOW')
  })
})
