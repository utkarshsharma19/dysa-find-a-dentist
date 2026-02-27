import { describe, it, expect } from 'vitest'
import { applyHardFilters } from '../matching/hard-filters.js'
import { scoreClinic } from '../matching/scoring/index.js'
import { assignBuckets, computeDisplayConfidence } from '../matching/bucketing.js'
import type { CandidateClinic, MatchInput } from '../matching/types.js'
import type { ScoredClinic } from '../matching/scoring/types.js'

// ---------- Fixed IDs matching seed data ----------
const IDS = {
  BALTIMORE_FQHC: '11111111-1111-1111-1111-111111111101',
  UMD_DENTAL_SCHOOL: '11111111-1111-1111-1111-111111111102',
  SILVER_SPRING_FREE: '11111111-1111-1111-1111-111111111103',
  ANNAPOLIS_PRIVATE: '11111111-1111-1111-1111-111111111104',
  FREDERICK_COUNTY_HD: '11111111-1111-1111-1111-111111111105',
  TOWSON_HOSPITAL_ED: '11111111-1111-1111-1111-111111111106',
  PG_MOBILE_UNIT: '11111111-1111-1111-1111-111111111107',
  COLUMBIA_FQHC: '11111111-1111-1111-1111-111111111108',
  HAGERSTOWN_NONPROFIT: '11111111-1111-1111-1111-111111111109',
  ROCKVILLE_PRIVATE: '11111111-1111-1111-1111-111111111110',
  SALISBURY_FREE: '11111111-1111-1111-1111-111111111111',
  WALDORF_FQHC: '11111111-1111-1111-1111-111111111112',
  BETHESDA_HOSPITAL_CLINIC: '11111111-1111-1111-1111-111111111113',
  BOWIE_PRIVATE_FULL: '11111111-1111-1111-1111-111111111114',
  INACTIVE_CLINIC: '11111111-1111-1111-1111-111111111115',
  DUNDALK_COUNTY_HD: '11111111-1111-1111-1111-111111111116',
}

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

type Svc = CandidateClinic['services'][0]
type AR = NonNullable<CandidateClinic['accessRules']>

function svc(
  serviceType: Svc['serviceType'],
  opts: {
    medicaid?: boolean
    uninsured?: boolean
    priv?: boolean
    newPatients?: boolean
    verified?: Date | undefined
  } = {},
): Svc {
  return {
    serviceType,
    availableForMedicaid: opts.medicaid ?? true,
    availableForUninsured: opts.uninsured ?? true,
    availableForPrivate: opts.priv ?? true,
    newPatientsAccepted: opts.newPatients ?? true,
    lastVerifiedAt: 'verified' in opts ? opts.verified : thirtyDaysAgo,
  }
}

function fullServices(medicaid: boolean, uninsured: boolean, verified: Date): Svc[] {
  const types: Svc['serviceType'][] = [
    'EXAM',
    'XRAY',
    'CLEANING',
    'FILLING',
    'EXTRACTION_SIMPLE',
    'ROOT_CANAL',
    'CROWN',
    'EMERGENCY_VISIT',
    'ABSCESS_DRAINAGE',
    'PRESCRIPTION_ONLY',
  ]
  return types.map((t) => svc(t, { medicaid, uninsured, verified }))
}

const baseAccess = (overrides: Partial<AR> = {}): AR => ({
  acceptsMedicaidAdults: 'YES',
  acceptsMedicaidChildren: 'YES',
  medicaidPlansAccepted: [],
  acceptsMedicare: 'YES',
  uninsuredWelcome: 'YES',
  slidingScaleAvailable: 'YES',
  seesEmergencyPain: 'YES',
  seesSwelling: 'YES',
  walkInAllowed: 'YES',
  referralRequired: 'NO',
  ...overrides,
})

// ---------- 16 Seed Clinics ----------
const CANDIDATES: CandidateClinic[] = [
  {
    id: IDS.BALTIMORE_FQHC,
    name: 'Baltimore Community Dental Center',
    clinicType: 'FQHC',
    address: '100 N Charles St',
    city: 'Baltimore',
    state: 'MD',
    zip: '21201',
    county: 'Baltimore City',
    lat: 39.2904,
    lng: -76.6122,
    phone: '410-555-0101',
    websiteUrl: 'https://example.com/baltimore-fqhc',
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: true,
    lastVerifiedAt: thirtyDaysAgo,
    accessRules: baseAccess(),
    services: [
      ...fullServices(true, true, thirtyDaysAgo),
      svc('EXTRACTION_SURGICAL'),
      svc('DENTURE_FULL', { uninsured: false }),
      svc('DENTURE_PARTIAL', { uninsured: false }),
    ],
    serviceRules: [],
    pricingEntries: [
      {
        serviceType: 'EXAM',
        priceMin: '0',
        priceMax: '40',
        pricingModel: 'SLIDING_SCALE',
        lastVerifiedAt: thirtyDaysAgo,
      },
      {
        serviceType: 'CLEANING',
        priceMin: '0',
        priceMax: '50',
        pricingModel: 'SLIDING_SCALE',
        lastVerifiedAt: thirtyDaysAgo,
      },
      {
        serviceType: 'EMERGENCY_VISIT',
        priceMin: '0',
        priceMax: '3',
        pricingModel: 'MEDICAID_RATE',
        medicaidCopay: '3',
        lastVerifiedAt: thirtyDaysAgo,
      },
    ],
    accessTimingEntries: [
      { serviceType: 'EMERGENCY_VISIT', insuranceType: null, nextAvailableDaysEstimate: 0 },
      { serviceType: 'EXAM', insuranceType: 'MEDICAID', nextAvailableDaysEstimate: 5 },
    ],
  },
  {
    id: IDS.UMD_DENTAL_SCHOOL,
    name: 'University of Maryland Dental School Clinic',
    clinicType: 'DENTAL_SCHOOL',
    address: '650 W Baltimore St',
    city: 'Baltimore',
    state: 'MD',
    zip: '21201',
    county: 'Baltimore City',
    lat: 39.2889,
    lng: -76.6277,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH', 'KOREAN'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: true,
    lastVerifiedAt: ninetyDaysAgo,
    accessRules: baseAccess({
      walkInAllowed: 'NO',
      seesEmergencyPain: 'LIMITED',
      seesSwelling: 'LIMITED',
    }),
    services: [
      ...fullServices(true, true, ninetyDaysAgo),
      svc('EXTRACTION_SURGICAL', { verified: ninetyDaysAgo }),
      svc('DENTURE_FULL', { verified: ninetyDaysAgo }),
      svc('DENTURE_PARTIAL', { verified: ninetyDaysAgo }),
    ],
    serviceRules: [],
    pricingEntries: [
      {
        serviceType: 'EXAM',
        priceMin: '15',
        priceMax: '30',
        pricingModel: 'FLAT',
        lastVerifiedAt: ninetyDaysAgo,
      },
      {
        serviceType: 'ROOT_CANAL',
        priceMin: '100',
        priceMax: '200',
        pricingModel: 'FLAT',
        lastVerifiedAt: ninetyDaysAgo,
      },
    ],
    accessTimingEntries: [
      { serviceType: 'EXAM', insuranceType: null, nextAvailableDaysEstimate: 30 },
      { serviceType: 'CLEANING', insuranceType: null, nextAvailableDaysEstimate: 45 },
    ],
  },
  {
    id: IDS.SILVER_SPRING_FREE,
    name: 'Silver Spring Free Dental Clinic',
    clinicType: 'FREE_CLINIC',
    address: '8500 Fenton St',
    city: 'Silver Spring',
    state: 'MD',
    zip: '20910',
    county: 'Montgomery',
    lat: 38.9947,
    lng: -77.0261,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH', 'AMHARIC'],
    adaAccessible: 'YES',
    parkingAvailable: 'NO',
    nearTransitStop: true,
    lastVerifiedAt: ninetyDaysAgo,
    accessRules: baseAccess({
      acceptsMedicaidAdults: 'NO',
      acceptsMedicaidChildren: 'NO',
      acceptsMedicare: 'NO',
      slidingScaleAvailable: 'NO',
      walkInAllowed: 'NO',
      seesSwelling: 'NO',
      seesEmergencyPain: 'LIMITED',
    }),
    services: (
      [
        'EXAM',
        'XRAY',
        'CLEANING',
        'FILLING',
        'EXTRACTION_SIMPLE',
        'PRESCRIPTION_ONLY',
      ] as Svc['serviceType'][]
    ).map((s) => svc(s, { medicaid: false, priv: false, verified: ninetyDaysAgo })),
    serviceRules: [],
    pricingEntries: [
      {
        serviceType: 'EXAM',
        priceMin: '0',
        priceMax: '0',
        pricingModel: 'DONATION_BASED',
        lastVerifiedAt: ninetyDaysAgo,
      },
      {
        serviceType: 'CLEANING',
        priceMin: '0',
        priceMax: '0',
        pricingModel: 'DONATION_BASED',
        lastVerifiedAt: ninetyDaysAgo,
      },
      {
        serviceType: 'FILLING',
        priceMin: '0',
        priceMax: '0',
        pricingModel: 'DONATION_BASED',
        lastVerifiedAt: ninetyDaysAgo,
      },
    ],
    accessTimingEntries: [
      { serviceType: null, insuranceType: 'UNINSURED_SELF_PAY', nextAvailableDaysEstimate: 21 },
    ],
  },
  {
    id: IDS.ANNAPOLIS_PRIVATE,
    name: 'Chesapeake Dental Associates',
    clinicType: 'PRIVATE_MEDICAID',
    address: '200 Main St',
    city: 'Annapolis',
    state: 'MD',
    zip: '21401',
    county: 'Anne Arundel',
    lat: 38.9784,
    lng: -76.4922,
    active: true,
    languagesAvailable: ['ENGLISH'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: false,
    lastVerifiedAt: thirtyDaysAgo,
    accessRules: baseAccess({
      medicaidPlansAccepted: ['PRIORITY_PARTNERS', 'AMERIGROUP', 'UNITED_HEALTHCARE'],
      uninsuredWelcome: 'NO',
      acceptsMedicare: 'NO',
      slidingScaleAvailable: 'NO',
      walkInAllowed: 'NO',
    }),
    services: fullServices(true, false, thirtyDaysAgo),
    serviceRules: [
      { serviceType: 'ROOT_CANAL', insuranceType: 'MEDICAID', accepts: 'NO' as const },
      { serviceType: 'CROWN', insuranceType: 'MEDICAID', accepts: 'NO' as const },
    ],
    pricingEntries: [
      {
        serviceType: 'EXAM',
        priceMin: '75',
        priceMax: '150',
        pricingModel: 'FLAT',
        medicaidCopay: '3',
        lastVerifiedAt: thirtyDaysAgo,
      },
    ],
    accessTimingEntries: [
      { serviceType: 'EXAM', insuranceType: 'MEDICAID', nextAvailableDaysEstimate: 7 },
      { serviceType: 'EMERGENCY_VISIT', insuranceType: null, nextAvailableDaysEstimate: 1 },
    ],
  },
  {
    id: IDS.FREDERICK_COUNTY_HD,
    name: 'Frederick County Health Department Dental',
    clinicType: 'COUNTY_HEALTH_DEPT',
    address: '350 Montevue Ln',
    city: 'Frederick',
    state: 'MD',
    zip: '21702',
    county: 'Frederick',
    lat: 39.4143,
    lng: -77.4105,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: false,
    lastVerifiedAt: ninetyDaysAgo,
    accessRules: baseAccess({ walkInAllowed: 'LIMITED', slidingScaleAvailable: 'YES' }),
    services: (
      [
        'EXAM',
        'XRAY',
        'CLEANING',
        'FILLING',
        'EXTRACTION_SIMPLE',
        'EMERGENCY_VISIT',
        'ABSCESS_DRAINAGE',
        'PRESCRIPTION_ONLY',
      ] as Svc['serviceType'][]
    ).map((s) => svc(s, { verified: ninetyDaysAgo })),
    serviceRules: [],
    pricingEntries: [],
    accessTimingEntries: [],
  },
  {
    id: IDS.TOWSON_HOSPITAL_ED,
    name: 'Greater Baltimore Medical Center ED',
    clinicType: 'HOSPITAL_ED',
    address: '6701 N Charles St',
    city: 'Towson',
    state: 'MD',
    zip: '21204',
    county: 'Baltimore',
    lat: 39.3945,
    lng: -76.6097,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: false,
    lastVerifiedAt: thirtyDaysAgo,
    accessRules: baseAccess({ slidingScaleAvailable: 'NO' }),
    services: (
      [
        'EMERGENCY_VISIT',
        'ABSCESS_DRAINAGE',
        'PRESCRIPTION_ONLY',
        'EXAM',
        'XRAY',
      ] as Svc['serviceType'][]
    ).map((s) => svc(s)),
    serviceRules: [
      { serviceType: 'CLEANING', insuranceType: 'MEDICAID', accepts: 'NO' as const },
      { serviceType: 'CLEANING', insuranceType: 'UNINSURED_SELF_PAY', accepts: 'NO' as const },
      { serviceType: 'FILLING', insuranceType: 'MEDICAID', accepts: 'NO' as const },
      { serviceType: 'FILLING', insuranceType: 'UNINSURED_SELF_PAY', accepts: 'NO' as const },
    ],
    pricingEntries: [],
    accessTimingEntries: [
      { serviceType: 'EMERGENCY_VISIT', insuranceType: null, nextAvailableDaysEstimate: 0 },
    ],
  },
  {
    id: IDS.PG_MOBILE_UNIT,
    name: "Prince George's Mobile Dental Van",
    clinicType: 'MOBILE_UNIT',
    address: '9201 Basil Ct',
    city: 'Largo',
    state: 'MD',
    zip: '20774',
    county: "Prince George's",
    lat: 38.8838,
    lng: -76.8311,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH'],
    adaAccessible: 'NO',
    parkingAvailable: 'UNKNOWN',
    nearTransitStop: false,
    lastVerifiedAt: oneYearAgo,
    accessRules: baseAccess({
      acceptsMedicare: 'NO',
      slidingScaleAvailable: 'NO',
      seesEmergencyPain: 'NO',
      seesSwelling: 'NO',
      lastVerifiedAt: oneYearAgo,
    }),
    services: (
      [
        'EXAM',
        'XRAY',
        'CLEANING',
        'FILLING',
        'EXTRACTION_SIMPLE',
        'PRESCRIPTION_ONLY',
      ] as Svc['serviceType'][]
    ).map((s) => svc(s, { priv: false, verified: undefined })),
    serviceRules: [],
    pricingEntries: [],
    accessTimingEntries: [],
  },
  {
    id: IDS.COLUMBIA_FQHC,
    name: 'Columbia Dental Health Center',
    clinicType: 'FQHC',
    address: '5500 Knoll North Dr',
    city: 'Columbia',
    state: 'MD',
    zip: '21045',
    county: 'Howard',
    lat: 39.2037,
    lng: -76.861,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH', 'KOREAN', 'CHINESE'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: false,
    lastVerifiedAt: thirtyDaysAgo,
    accessRules: baseAccess(),
    services: [
      ...fullServices(true, true, thirtyDaysAgo),
      svc('DENTURE_FULL'),
      svc('DENTURE_PARTIAL'),
    ],
    serviceRules: [],
    pricingEntries: [
      {
        serviceType: 'EXAM',
        priceMin: '0',
        priceMax: '35',
        pricingModel: 'SLIDING_SCALE',
        lastVerifiedAt: thirtyDaysAgo,
      },
    ],
    accessTimingEntries: [
      { serviceType: 'EMERGENCY_VISIT', insuranceType: null, nextAvailableDaysEstimate: 0 },
      { serviceType: 'EXAM', insuranceType: 'MEDICAID', nextAvailableDaysEstimate: 3 },
    ],
  },
  {
    id: IDS.HAGERSTOWN_NONPROFIT,
    name: 'Western Maryland Dental Mission',
    clinicType: 'NONPROFIT',
    address: '100 W Washington St',
    city: 'Hagerstown',
    state: 'MD',
    zip: '21740',
    county: 'Washington',
    lat: 39.6418,
    lng: -77.72,
    active: true,
    languagesAvailable: ['ENGLISH'],
    adaAccessible: 'UNKNOWN',
    parkingAvailable: 'YES',
    nearTransitStop: false,
    lastVerifiedAt: oneYearAgo,
    accessRules: baseAccess({
      acceptsMedicare: 'NO',
      walkInAllowed: 'NO',
      seesSwelling: 'LIMITED',
      lastVerifiedAt: oneYearAgo,
    }),
    services: (
      [
        'EXAM',
        'XRAY',
        'CLEANING',
        'FILLING',
        'EXTRACTION_SIMPLE',
        'EMERGENCY_VISIT',
        'PRESCRIPTION_ONLY',
      ] as Svc['serviceType'][]
    ).map((s) => svc(s, { priv: false, verified: undefined })),
    serviceRules: [],
    pricingEntries: [
      { serviceType: 'EXAM', priceMin: '0', priceMax: '0', pricingModel: 'DONATION_BASED' },
    ],
    accessTimingEntries: [],
  },
  {
    id: IDS.ROCKVILLE_PRIVATE,
    name: 'Rockville Family Dental',
    clinicType: 'PRIVATE_MEDICAID',
    address: '12000 Rockville Pike',
    city: 'Rockville',
    state: 'MD',
    zip: '20852',
    county: 'Montgomery',
    lat: 39.084,
    lng: -77.1528,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH', 'CHINESE'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: true,
    lastVerifiedAt: thirtyDaysAgo,
    accessRules: baseAccess({
      medicaidPlansAccepted: [
        'PRIORITY_PARTNERS',
        'MARYLAND_PHYSICIANS_CARE',
        'MEDSTAR_FAMILY_CHOICE',
        'WELLPOINT',
      ],
      uninsuredWelcome: 'NO',
      slidingScaleAvailable: 'NO',
      walkInAllowed: 'NO',
    }),
    services: [
      ...fullServices(true, false, thirtyDaysAgo),
      svc('EXTRACTION_SURGICAL', { uninsured: false }),
    ],
    serviceRules: [
      {
        serviceType: 'EXTRACTION_SURGICAL',
        insuranceType: 'MEDICAID',
        accepts: 'LIMITED' as const,
      },
    ],
    pricingEntries: [
      {
        serviceType: 'EXAM',
        priceMin: '80',
        priceMax: '160',
        pricingModel: 'FLAT',
        medicaidCopay: '3',
        lastVerifiedAt: thirtyDaysAgo,
      },
    ],
    accessTimingEntries: [
      { serviceType: 'EXAM', insuranceType: 'MEDICAID', nextAvailableDaysEstimate: 10 },
    ],
  },
  {
    id: IDS.SALISBURY_FREE,
    name: 'Eastern Shore Free Dental',
    clinicType: 'FREE_CLINIC',
    address: '306 W Main St',
    city: 'Salisbury',
    state: 'MD',
    zip: '21801',
    county: 'Wicomico',
    lat: 38.3607,
    lng: -75.5994,
    active: true,
    languagesAvailable: ['ENGLISH'],
    adaAccessible: 'UNKNOWN',
    parkingAvailable: 'YES',
    nearTransitStop: false,
    lastVerifiedAt: ninetyDaysAgo,
    accessRules: baseAccess({
      acceptsMedicaidAdults: 'NO',
      acceptsMedicaidChildren: 'NO',
      acceptsMedicare: 'NO',
      slidingScaleAvailable: 'NO',
      walkInAllowed: 'NO',
      seesSwelling: 'NO',
      seesEmergencyPain: 'LIMITED',
    }),
    services: (
      ['EXAM', 'XRAY', 'CLEANING', 'FILLING', 'EXTRACTION_SIMPLE'] as Svc['serviceType'][]
    ).map((s) => svc(s, { medicaid: false, priv: false, verified: ninetyDaysAgo })),
    serviceRules: [],
    pricingEntries: [],
    accessTimingEntries: [],
  },
  {
    id: IDS.WALDORF_FQHC,
    name: 'Southern Maryland Dental Center',
    clinicType: 'FQHC',
    address: '3035 Leonardtown Rd',
    city: 'Waldorf',
    state: 'MD',
    zip: '20601',
    county: 'Charles',
    lat: 38.6246,
    lng: -76.9191,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: false,
    lastVerifiedAt: ninetyDaysAgo,
    accessRules: baseAccess({ walkInAllowed: 'LIMITED' }),
    services: fullServices(true, true, ninetyDaysAgo),
    serviceRules: [],
    pricingEntries: [
      {
        serviceType: 'EXAM',
        priceMin: '0',
        priceMax: '40',
        pricingModel: 'SLIDING_SCALE',
        lastVerifiedAt: ninetyDaysAgo,
      },
    ],
    accessTimingEntries: [
      { serviceType: 'EXAM', insuranceType: null, nextAvailableDaysEstimate: 7 },
      { serviceType: 'EMERGENCY_VISIT', insuranceType: null, nextAvailableDaysEstimate: 1 },
    ],
  },
  {
    id: IDS.BETHESDA_HOSPITAL_CLINIC,
    name: 'Suburban Hospital Dental Clinic',
    clinicType: 'HOSPITAL_CLINIC',
    address: '8600 Old Georgetown Rd',
    city: 'Bethesda',
    state: 'MD',
    zip: '20814',
    county: 'Montgomery',
    lat: 39.0,
    lng: -77.106,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH', 'FRENCH'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: true,
    lastVerifiedAt: thirtyDaysAgo,
    accessRules: baseAccess({ walkInAllowed: 'NO', referralRequired: 'YES' }),
    services: [...fullServices(true, true, thirtyDaysAgo), svc('EXTRACTION_SURGICAL')],
    serviceRules: [
      {
        serviceType: 'EXTRACTION_SURGICAL',
        insuranceType: 'MEDICAID',
        accepts: 'LIMITED' as const,
      },
    ],
    pricingEntries: [],
    accessTimingEntries: [],
  },
  {
    id: IDS.BOWIE_PRIVATE_FULL,
    name: 'Bowie Dental Care',
    clinicType: 'PRIVATE_MEDICAID',
    address: '15200 Major Lansdale Blvd',
    city: 'Bowie',
    state: 'MD',
    zip: '20716',
    county: "Prince George's",
    lat: 38.9429,
    lng: -76.7301,
    active: true,
    languagesAvailable: ['ENGLISH'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: false,
    lastVerifiedAt: thirtyDaysAgo,
    accessRules: baseAccess({
      acceptsNewAdultPatients: 'NO',
      medicaidPlansAccepted: ['AMERIGROUP', 'UNITED_HEALTHCARE'],
      uninsuredWelcome: 'NO',
      acceptsMedicare: 'NO',
      slidingScaleAvailable: 'NO',
      seesEmergencyPain: 'NO',
      seesSwelling: 'NO',
      walkInAllowed: 'NO',
    } as Partial<AR> as AR),
    services: fullServices(true, false, thirtyDaysAgo).map((s) => ({
      ...s,
      newPatientsAccepted: false,
    })),
    serviceRules: [],
    pricingEntries: [],
    accessTimingEntries: [],
  },
  {
    id: IDS.INACTIVE_CLINIC,
    name: 'Closed Eastern Dental (Inactive)',
    clinicType: 'OTHER',
    address: '400 E Pratt St',
    city: 'Baltimore',
    state: 'MD',
    zip: '21202',
    county: 'Baltimore City',
    lat: 39.2861,
    lng: -76.606,
    active: false,
    languagesAvailable: ['ENGLISH'],
    adaAccessible: 'UNKNOWN',
    parkingAvailable: 'UNKNOWN',
    nearTransitStop: true,
    lastVerifiedAt: oneYearAgo,
    accessRules: null,
    services: [],
    serviceRules: [],
    pricingEntries: [],
    accessTimingEntries: [],
  },
  {
    id: IDS.DUNDALK_COUNTY_HD,
    name: 'Dundalk Health Center Dental',
    clinicType: 'COUNTY_HEALTH_DEPT',
    address: '7702 Dunmanway',
    city: 'Dundalk',
    state: 'MD',
    zip: '21222',
    county: 'Baltimore',
    lat: 39.2506,
    lng: -76.5207,
    active: true,
    languagesAvailable: ['ENGLISH', 'SPANISH'],
    adaAccessible: 'YES',
    parkingAvailable: 'YES',
    nearTransitStop: true,
    lastVerifiedAt: ninetyDaysAgo,
    accessRules: baseAccess({ walkInAllowed: 'LIMITED' }),
    services: (
      [
        'EXAM',
        'XRAY',
        'CLEANING',
        'FILLING',
        'EXTRACTION_SIMPLE',
        'EMERGENCY_VISIT',
        'ABSCESS_DRAINAGE',
        'PRESCRIPTION_ONLY',
      ] as Svc['serviceType'][]
    ).map((s) => svc(s, { verified: ninetyDaysAgo })),
    serviceRules: [],
    pricingEntries: [],
    accessTimingEntries: [
      { serviceType: 'EXAM', insuranceType: null, nextAvailableDaysEstimate: 10 },
      { serviceType: 'EMERGENCY_VISIT', insuranceType: null, nextAvailableDaysEstimate: 0 },
    ],
  },
]

// ---------- Pipeline runner ----------
function runPipeline(input: MatchInput, candidates: CandidateClinic[]) {
  const { passed, rejected } = applyHardFilters(candidates, input)
  const scored: ScoredClinic[] = passed.map((c) => scoreClinic(c, input))
  scored.sort((a, b) => b.totalScore - a.totalScore)
  const bucketed = assignBuckets(scored)
  const top = bucketed.slice(0, 15)
  return { passed, rejected, scored: top, allScored: bucketed }
}

const BALTIMORE_LAT = 39.2904
const BALTIMORE_LNG = -76.6122

// ---------- Regression scenarios ----------
describe('Matching Regression Harness', () => {
  it('Scenario 1: Medicaid patient in Baltimore with tooth pain', () => {
    const input: MatchInput = {
      sessionId: 'reg-1',
      chiefComplaint: 'PAIN',
      insuranceType: 'MEDICAID',
      urgency: 'TODAY',
      lat: BALTIMORE_LAT,
      lng: BALTIMORE_LNG,
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_30_MIN',
    }

    const { scored, rejected } = runPipeline(input, CANDIDATES)

    // Inactive clinic must be rejected
    expect(rejected.some((r) => r.clinicId === IDS.INACTIVE_CLINIC)).toBe(true)

    // Silver Spring Free rejects Medicaid
    expect(rejected.some((r) => r.clinicId === IDS.SILVER_SPRING_FREE)).toBe(true)

    // Salisbury Free rejects Medicaid
    expect(rejected.some((r) => r.clinicId === IDS.SALISBURY_FREE)).toBe(true)

    // Baltimore FQHC should be in results and score well
    const baltimoreFqhc = scored.find((s) => s.clinicId === IDS.BALTIMORE_FQHC)
    expect(baltimoreFqhc).toBeDefined()
    expect(baltimoreFqhc!.bucket).toBe('BEST_MATCH')

    // Top result should be a nearby Baltimore clinic
    const topClinicId = scored[0].clinicId
    const topClinic = CANDIDATES.find((c) => c.id === topClinicId)
    expect(['Baltimore', 'Towson', 'Dundalk']).toContain(topClinic?.city)
  })

  it('Scenario 2: Uninsured patient, budget-constrained (FREE_ONLY)', () => {
    const input: MatchInput = {
      sessionId: 'reg-2',
      chiefComplaint: 'CLEANING_CHECKUP',
      insuranceType: 'UNINSURED_SELF_PAY',
      urgency: 'WITHIN_2_WEEKS',
      budgetBand: 'FREE_ONLY',
      lat: 38.9947,
      lng: -77.0261,
      travelMode: 'PUBLIC_TRANSIT',
      travelTime: 'UP_TO_30_MIN',
    }

    const { scored, rejected } = runPipeline(input, CANDIDATES)

    // Rockville Private rejects uninsured
    expect(rejected.some((r) => r.clinicId === IDS.ROCKVILLE_PRIVATE)).toBe(true)

    // Annapolis Private rejects uninsured
    expect(rejected.some((r) => r.clinicId === IDS.ANNAPOLIS_PRIVATE)).toBe(true)

    // Silver Spring Free should rank well (free, close, accepts uninsured)
    const silverSpring = scored.find((s) => s.clinicId === IDS.SILVER_SPRING_FREE)
    expect(silverSpring).toBeDefined()
    if (silverSpring) {
      expect(silverSpring.breakdown.cost).toBeGreaterThanOrEqual(0.8)
    }
  })

  it('Scenario 3: Emergency pain — walk-in clinics score high on access', () => {
    const input: MatchInput = {
      sessionId: 'reg-3',
      chiefComplaint: 'PAIN',
      insuranceType: 'MEDICAID',
      urgency: 'TODAY',
      lat: BALTIMORE_LAT,
      lng: BALTIMORE_LNG,
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_60_MIN',
    }

    const { scored } = runPipeline(input, CANDIDATES)

    const baltimoreFqhc = scored.find((s) => s.clinicId === IDS.BALTIMORE_FQHC)
    expect(baltimoreFqhc).toBeDefined()
    expect(baltimoreFqhc!.breakdown.access).toBeGreaterThanOrEqual(0.8)

    const columbiaFqhc = scored.find((s) => s.clinicId === IDS.COLUMBIA_FQHC)
    expect(columbiaFqhc).toBeDefined()
    expect(columbiaFqhc!.breakdown.access).toBeGreaterThanOrEqual(0.8)
  })

  it('Scenario 4: Routine cleaning, just exploring', () => {
    const input: MatchInput = {
      sessionId: 'reg-4',
      chiefComplaint: 'CLEANING_CHECKUP',
      insuranceType: 'MEDICAID',
      urgency: 'JUST_EXPLORING',
      lat: BALTIMORE_LAT,
      lng: BALTIMORE_LNG,
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_60_MIN',
    }

    const { scored } = runPipeline(input, CANDIDATES)
    expect(scored.length).toBeGreaterThanOrEqual(5)

    for (const s of scored) {
      expect(s.breakdown.access).toBeGreaterThanOrEqual(0.5)
    }
  })

  it('Scenario 5: Eastern Shore — distance filters most clinics', () => {
    const input: MatchInput = {
      sessionId: 'reg-5',
      chiefComplaint: 'CLEANING_CHECKUP',
      insuranceType: 'UNINSURED_SELF_PAY',
      urgency: 'WITHIN_2_WEEKS',
      lat: 38.3607,
      lng: -75.5994,
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_30_MIN',
    }

    const { scored } = runPipeline(input, CANDIDATES)

    const salisbury = scored.find((s) => s.clinicId === IDS.SALISBURY_FREE)
    expect(salisbury).toBeDefined()
    expect(salisbury!.breakdown.distance).toBeGreaterThanOrEqual(0.9)

    // Baltimore is ~100 miles away — should be filtered out by distance
    const baltimoreFqhc = scored.find((s) => s.clinicId === IDS.BALTIMORE_FQHC)
    if (baltimoreFqhc) {
      expect(baltimoreFqhc.breakdown.distance).toBeLessThan(0.1)
    }
  })

  it('Scenario 6: Language preference (Korean)', () => {
    const input: MatchInput = {
      sessionId: 'reg-6',
      chiefComplaint: 'CLEANING_CHECKUP',
      insuranceType: 'MEDICAID',
      urgency: 'WITHIN_2_WEEKS',
      lat: BALTIMORE_LAT,
      lng: BALTIMORE_LNG,
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_60_MIN',
      languagePreference: 'KOREAN',
    }

    const { scored } = runPipeline(input, CANDIDATES)

    const koreanClinics = scored.filter((s) => {
      const c = CANDIDATES.find((cand) => cand.id === s.clinicId)
      return c?.languagesAvailable?.includes('KOREAN')
    })
    expect(koreanClinics.length).toBeGreaterThanOrEqual(1)
  })

  it('Scenario 7: Stale data penalty for old verification', () => {
    const input: MatchInput = {
      sessionId: 'reg-7',
      chiefComplaint: 'CLEANING_CHECKUP',
      insuranceType: 'MEDICAID',
      urgency: 'JUST_EXPLORING',
      lat: 39.6418,
      lng: -77.72,
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_30_MIN',
    }

    const { scored } = runPipeline(input, CANDIDATES)

    const hagerstown = scored.find((s) => s.clinicId === IDS.HAGERSTOWN_NONPROFIT)
    if (hagerstown) {
      expect(hagerstown.breakdown.freshness).toBeLessThan(0.5)
      expect(hagerstown.reasonCodes).toContain('STALE_DATA_PENALTY')
    }
  })

  it('Scenario 8: Inactive clinic always excluded', () => {
    const input: MatchInput = {
      sessionId: 'reg-8',
      chiefComplaint: 'NOT_SURE',
      insuranceType: 'NOT_SURE',
      urgency: 'JUST_EXPLORING',
      lat: BALTIMORE_LAT,
      lng: BALTIMORE_LNG,
      travelMode: 'DRIVES',
      travelTime: 'ANY_DISTANCE',
    }

    const { rejected, scored } = runPipeline(input, CANDIDATES)

    expect(rejected.some((r) => r.clinicId === IDS.INACTIVE_CLINIC)).toBe(true)
    expect(rejected.find((r) => r.clinicId === IDS.INACTIVE_CLINIC)?.reasons).toContain('INACTIVE')
    expect(scored.some((s) => s.clinicId === IDS.INACTIVE_CLINIC)).toBe(false)
  })

  it('Scenario 9: Medicaid plan mismatch filters correctly', () => {
    const input: MatchInput = {
      sessionId: 'reg-9',
      chiefComplaint: 'CLEANING_CHECKUP',
      insuranceType: 'MEDICAID',
      medicaidPlan: 'JAI_MEDICAL',
      urgency: 'WITHIN_2_WEEKS',
      lat: 38.9784,
      lng: -76.4922,
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_30_MIN',
    }

    const { rejected } = runPipeline(input, CANDIDATES)

    expect(rejected.some((r) => r.clinicId === IDS.ANNAPOLIS_PRIVATE)).toBe(true)
    const annapolisRejection = rejected.find((r) => r.clinicId === IDS.ANNAPOLIS_PRIVATE)
    expect(annapolisRejection?.reasons).toContain('MEDICAID_PLAN_MISMATCH')
  })

  it('Scenario 10: Display confidence reflects unknown data', () => {
    const input: MatchInput = {
      sessionId: 'reg-10',
      chiefComplaint: 'PAIN',
      insuranceType: 'MEDICAID',
      urgency: 'TODAY',
      lat: BALTIMORE_LAT,
      lng: BALTIMORE_LNG,
      travelMode: 'DRIVES',
      travelTime: 'UP_TO_60_MIN',
    }

    const { scored } = runPipeline(input, CANDIDATES)

    const unknownCodes = [
      'ELIGIBILITY_UNKNOWN',
      'DISTANCE_UNKNOWN',
      'PRICING_UNKNOWN',
      'SERVICE_DATA_MISSING',
      'NO_VERIFICATION_DATA',
    ]

    for (const s of scored) {
      const confidence = computeDisplayConfidence(s.reasonCodes)
      const unknownCount = s.reasonCodes.filter((c) => unknownCodes.includes(c)).length

      if (unknownCount === 0) expect(confidence).toBe('HIGH')
      else if (unknownCount <= 2) expect(confidence).toBe('MEDIUM')
      else expect(confidence).toBe('LOW')
    }
  })
})
