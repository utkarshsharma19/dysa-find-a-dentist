import { CLINIC_IDS } from './clinics.js'

type ServiceType =
  | 'EXAM'
  | 'XRAY'
  | 'CLEANING'
  | 'FILLING'
  | 'EXTRACTION_SIMPLE'
  | 'EXTRACTION_SURGICAL'
  | 'ROOT_CANAL'
  | 'CROWN'
  | 'DENTURE_FULL'
  | 'DENTURE_PARTIAL'
  | 'EMERGENCY_VISIT'
  | 'ABSCESS_DRAINAGE'
  | 'PRESCRIPTION_ONLY'
type PricingModel =
  | 'FLAT'
  | 'SLIDING_SCALE'
  | 'DONATION_BASED'
  | 'MEDICAID_RATE'
  | 'VARIES'
  | 'UNKNOWN'
type Confidence = 'VERIFIED_RECENTLY' | 'VERIFIED_OLD' | 'USER_REPORTED' | 'ESTIMATED' | 'UNKNOWN'

interface PricingRow {
  clinicId: string
  serviceType: ServiceType
  priceMin?: string
  priceMax?: string
  pricingModel: PricingModel
  medicaidCopay?: string
  confidence: Confidence
  lastVerifiedAt?: Date
}

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

function slidingScale(
  clinicId: string,
  service: ServiceType,
  min: string,
  max: string,
  lastVerified: Date,
): PricingRow {
  return {
    clinicId,
    serviceType: service,
    priceMin: min,
    priceMax: max,
    pricingModel: 'SLIDING_SCALE',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: lastVerified,
  }
}

function medicaidRate(
  clinicId: string,
  service: ServiceType,
  copay: string,
  lastVerified: Date,
): PricingRow {
  return {
    clinicId,
    serviceType: service,
    priceMin: '0',
    priceMax: copay,
    pricingModel: 'MEDICAID_RATE',
    medicaidCopay: copay,
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: lastVerified,
  }
}

export const pricingData: PricingRow[] = [
  // Baltimore FQHC: Sliding scale for uninsured, Medicaid rates
  slidingScale(CLINIC_IDS.BALTIMORE_FQHC, 'EXAM', '0', '40', thirtyDaysAgo),
  slidingScale(CLINIC_IDS.BALTIMORE_FQHC, 'CLEANING', '0', '50', thirtyDaysAgo),
  slidingScale(CLINIC_IDS.BALTIMORE_FQHC, 'FILLING', '0', '75', thirtyDaysAgo),
  slidingScale(CLINIC_IDS.BALTIMORE_FQHC, 'EXTRACTION_SIMPLE', '0', '80', thirtyDaysAgo),
  medicaidRate(CLINIC_IDS.BALTIMORE_FQHC, 'EMERGENCY_VISIT', '3', thirtyDaysAgo),

  // UMD Dental School: Low cost across the board
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'EXAM',
    priceMin: '15',
    priceMax: '30',
    pricingModel: 'FLAT',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'CLEANING',
    priceMin: '20',
    priceMax: '40',
    pricingModel: 'FLAT',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'FILLING',
    priceMin: '30',
    priceMax: '60',
    pricingModel: 'FLAT',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'ROOT_CANAL',
    priceMin: '100',
    priceMax: '200',
    pricingModel: 'FLAT',
    confidence: 'ESTIMATED',
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'CROWN',
    priceMin: '150',
    priceMax: '300',
    pricingModel: 'FLAT',
    confidence: 'ESTIMATED',
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'DENTURE_FULL',
    priceMin: '200',
    priceMax: '500',
    pricingModel: 'FLAT',
    confidence: 'ESTIMATED',
    lastVerifiedAt: ninetyDaysAgo,
  },

  // Silver Spring Free: Free for uninsured
  {
    clinicId: CLINIC_IDS.SILVER_SPRING_FREE,
    serviceType: 'EXAM',
    priceMin: '0',
    priceMax: '0',
    pricingModel: 'DONATION_BASED',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.SILVER_SPRING_FREE,
    serviceType: 'CLEANING',
    priceMin: '0',
    priceMax: '0',
    pricingModel: 'DONATION_BASED',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.SILVER_SPRING_FREE,
    serviceType: 'FILLING',
    priceMin: '0',
    priceMax: '0',
    pricingModel: 'DONATION_BASED',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.SILVER_SPRING_FREE,
    serviceType: 'EXTRACTION_SIMPLE',
    priceMin: '0',
    priceMax: '0',
    pricingModel: 'DONATION_BASED',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: ninetyDaysAgo,
  },

  // Annapolis Private: Standard private rates
  {
    clinicId: CLINIC_IDS.ANNAPOLIS_PRIVATE,
    serviceType: 'EXAM',
    priceMin: '75',
    priceMax: '150',
    pricingModel: 'FLAT',
    medicaidCopay: '3',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: thirtyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.ANNAPOLIS_PRIVATE,
    serviceType: 'FILLING',
    priceMin: '100',
    priceMax: '250',
    pricingModel: 'FLAT',
    medicaidCopay: '3',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: thirtyDaysAgo,
  },

  // Columbia FQHC: Sliding scale
  slidingScale(CLINIC_IDS.COLUMBIA_FQHC, 'EXAM', '0', '35', thirtyDaysAgo),
  slidingScale(CLINIC_IDS.COLUMBIA_FQHC, 'CLEANING', '0', '45', thirtyDaysAgo),
  slidingScale(CLINIC_IDS.COLUMBIA_FQHC, 'FILLING', '0', '70', thirtyDaysAgo),
  slidingScale(CLINIC_IDS.COLUMBIA_FQHC, 'EXTRACTION_SIMPLE', '0', '75', thirtyDaysAgo),
  slidingScale(CLINIC_IDS.COLUMBIA_FQHC, 'DENTURE_FULL', '50', '300', thirtyDaysAgo),

  // Hagerstown Nonprofit: Donation-based
  {
    clinicId: CLINIC_IDS.HAGERSTOWN_NONPROFIT,
    serviceType: 'EXAM',
    priceMin: '0',
    priceMax: '0',
    pricingModel: 'DONATION_BASED',
    confidence: 'VERIFIED_OLD',
  },
  {
    clinicId: CLINIC_IDS.HAGERSTOWN_NONPROFIT,
    serviceType: 'FILLING',
    priceMin: '0',
    priceMax: '25',
    pricingModel: 'DONATION_BASED',
    confidence: 'VERIFIED_OLD',
  },

  // Rockville Private: Market rates
  {
    clinicId: CLINIC_IDS.ROCKVILLE_PRIVATE,
    serviceType: 'EXAM',
    priceMin: '80',
    priceMax: '160',
    pricingModel: 'FLAT',
    medicaidCopay: '3',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: thirtyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.ROCKVILLE_PRIVATE,
    serviceType: 'FILLING',
    priceMin: '120',
    priceMax: '280',
    pricingModel: 'FLAT',
    medicaidCopay: '3',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: thirtyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.ROCKVILLE_PRIVATE,
    serviceType: 'CROWN',
    priceMin: '500',
    priceMax: '1200',
    pricingModel: 'FLAT',
    medicaidCopay: '3',
    confidence: 'VERIFIED_RECENTLY',
    lastVerifiedAt: thirtyDaysAgo,
  },

  // Waldorf FQHC: Sliding scale
  slidingScale(CLINIC_IDS.WALDORF_FQHC, 'EXAM', '0', '40', ninetyDaysAgo),
  slidingScale(CLINIC_IDS.WALDORF_FQHC, 'FILLING', '0', '80', ninetyDaysAgo),
]
