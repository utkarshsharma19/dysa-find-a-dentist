export type ChiefComplaint =
  | 'PAIN'
  | 'SWELLING'
  | 'BROKEN_CHIPPED_TOOTH'
  | 'TOOTH_KNOCKED_OUT'
  | 'NEED_TOOTH_PULLED'
  | 'FILLING_CROWN_FELL_OUT'
  | 'BUMP_ON_GUM'
  | 'CLEANING_CHECKUP'
  | 'DENTURES'
  | 'NOT_SURE'

export type InsuranceType =
  | 'MEDICAID'
  | 'MEDICARE'
  | 'DUAL_MEDICAID_MEDICARE'
  | 'PRIVATE'
  | 'UNINSURED_SELF_PAY'
  | 'NOT_SURE'

export type MedicaidPlan =
  | 'PRIORITY_PARTNERS'
  | 'AMERIGROUP'
  | 'MARYLAND_PHYSICIANS_CARE'
  | 'JAI_MEDICAL'
  | 'MEDSTAR_FAMILY_CHOICE'
  | 'UNITED_HEALTHCARE'
  | 'WELLPOINT'
  | 'OTHER'
  | 'UNSURE'

export type UrgencyLevel = 'TODAY' | 'WITHIN_3_DAYS' | 'WITHIN_2_WEEKS' | 'JUST_EXPLORING'
export type BudgetBand = 'FREE_ONLY' | 'UNDER_50' | '50_TO_150' | '150_PLUS' | 'NOT_SURE'
export type TravelMode =
  | 'DRIVES'
  | 'PUBLIC_TRANSIT'
  | 'WALK_ONLY'
  | 'RIDE_FROM_SOMEONE'
  | 'NOT_SURE'
export type TravelTime = 'UP_TO_15_MIN' | 'UP_TO_30_MIN' | 'UP_TO_60_MIN' | 'ANY_DISTANCE'

export type ServiceType =
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

export type EligibilityStatus = 'YES' | 'NO' | 'LIMITED' | 'UNKNOWN'
export type YesNoUnknown = 'YES' | 'NO' | 'UNKNOWN'

export interface MatchInput {
  sessionId: string
  chiefComplaint: ChiefComplaint
  insuranceType: InsuranceType
  medicaidPlan?: MedicaidPlan | null
  urgency: UrgencyLevel
  budgetBand?: BudgetBand | null
  travelMode?: TravelMode | null
  travelTime?: TravelTime | null
  lat?: number | null
  lng?: number | null
  languagePreference?: string | null
}

export interface CandidateClinic {
  id: string
  name: string
  clinicType: string
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  county?: string | null
  lat?: number | null
  lng?: number | null
  phone?: string | null
  websiteUrl?: string | null
  active: boolean
  languagesAvailable?: string[] | null
  adaAccessible?: YesNoUnknown | null
  parkingAvailable?: YesNoUnknown | null
  nearTransitStop?: boolean | null
  lastVerifiedAt?: Date | null

  accessRules?: {
    acceptsMedicaidAdults?: EligibilityStatus | null
    acceptsMedicaidChildren?: EligibilityStatus | null
    medicaidPlansAccepted?: MedicaidPlan[] | null
    acceptsMedicare?: YesNoUnknown | null
    uninsuredWelcome?: EligibilityStatus | null
    slidingScaleAvailable?: YesNoUnknown | null
    seesEmergencyPain?: EligibilityStatus | null
    seesSwelling?: EligibilityStatus | null
    walkInAllowed?: EligibilityStatus | null
    referralRequired?: YesNoUnknown | null
    lastVerifiedAt?: Date | null
  } | null

  services: Array<{
    serviceType: ServiceType
    availableForMedicaid: boolean
    availableForUninsured: boolean
    availableForPrivate: boolean
    newPatientsAccepted: boolean
    lastVerifiedAt?: Date | null
  }>

  serviceRules: Array<{
    serviceType: ServiceType
    insuranceType: InsuranceType
    accepts: EligibilityStatus
  }>

  pricingEntries: Array<{
    serviceType: ServiceType
    priceMin?: string | null
    priceMax?: string | null
    pricingModel?: string | null
    medicaidCopay?: string | null
    lastVerifiedAt?: Date | null
  }>

  accessTimingEntries: Array<{
    serviceType?: ServiceType | null
    insuranceType?: InsuranceType | null
    nextAvailableDaysEstimate?: number | null
  }>
}

export interface FilteredClinic extends CandidateClinic {
  filterReasons?: string[]
}
