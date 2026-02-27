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
type InsuranceType =
  | 'MEDICAID'
  | 'MEDICARE'
  | 'DUAL_MEDICAID_MEDICARE'
  | 'PRIVATE'
  | 'UNINSURED_SELF_PAY'
  | 'NOT_SURE'

interface AccessTimingRow {
  clinicId: string
  serviceType: ServiceType | null
  insuranceType: InsuranceType | null
  nextAvailableDaysEstimate: number | null
  bestCallTimes?: string
  phoneAnswerDifficulty?: number
}

export const accessTimingData: AccessTimingRow[] = [
  // Baltimore FQHC: Walk-in same day, appointments 3-5 days
  {
    clinicId: CLINIC_IDS.BALTIMORE_FQHC,
    serviceType: 'EMERGENCY_VISIT',
    insuranceType: null,
    nextAvailableDaysEstimate: 0,
    bestCallTimes: 'Mon-Wed 8am',
    phoneAnswerDifficulty: 2,
  },
  {
    clinicId: CLINIC_IDS.BALTIMORE_FQHC,
    serviceType: 'EXAM',
    insuranceType: 'MEDICAID',
    nextAvailableDaysEstimate: 5,
    bestCallTimes: 'Mon-Fri 8-9am',
    phoneAnswerDifficulty: 2,
  },
  {
    clinicId: CLINIC_IDS.BALTIMORE_FQHC,
    serviceType: 'CLEANING',
    insuranceType: 'MEDICAID',
    nextAvailableDaysEstimate: 14,
    bestCallTimes: 'Mon-Fri 8-9am',
    phoneAnswerDifficulty: 2,
  },

  // UMD Dental School: Long waits
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'EXAM',
    insuranceType: null,
    nextAvailableDaysEstimate: 30,
    bestCallTimes: 'Tue-Thu 9am',
    phoneAnswerDifficulty: 3,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'CLEANING',
    insuranceType: null,
    nextAvailableDaysEstimate: 45,
    bestCallTimes: 'Tue-Thu 9am',
    phoneAnswerDifficulty: 3,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'DENTURE_FULL',
    insuranceType: null,
    nextAvailableDaysEstimate: 60,
    bestCallTimes: 'Tue-Thu 9am',
    phoneAnswerDifficulty: 3,
  },

  // Silver Spring Free: Limited slots
  {
    clinicId: CLINIC_IDS.SILVER_SPRING_FREE,
    serviceType: null,
    insuranceType: 'UNINSURED_SELF_PAY',
    nextAvailableDaysEstimate: 21,
    bestCallTimes: 'Tue 5-6pm',
    phoneAnswerDifficulty: 4,
  },

  // Annapolis Private: Moderate waits
  {
    clinicId: CLINIC_IDS.ANNAPOLIS_PRIVATE,
    serviceType: 'EXAM',
    insuranceType: 'MEDICAID',
    nextAvailableDaysEstimate: 7,
    bestCallTimes: 'Mon-Fri 8-10am',
    phoneAnswerDifficulty: 1,
  },
  {
    clinicId: CLINIC_IDS.ANNAPOLIS_PRIVATE,
    serviceType: 'EMERGENCY_VISIT',
    insuranceType: null,
    nextAvailableDaysEstimate: 1,
    bestCallTimes: 'Mon-Fri 8am',
    phoneAnswerDifficulty: 1,
  },

  // Towson Hospital ED: Same day
  {
    clinicId: CLINIC_IDS.TOWSON_HOSPITAL_ED,
    serviceType: 'EMERGENCY_VISIT',
    insuranceType: null,
    nextAvailableDaysEstimate: 0,
    phoneAnswerDifficulty: 1,
  },

  // Columbia FQHC: Walk-in available
  {
    clinicId: CLINIC_IDS.COLUMBIA_FQHC,
    serviceType: 'EMERGENCY_VISIT',
    insuranceType: null,
    nextAvailableDaysEstimate: 0,
    bestCallTimes: 'Mon-Fri 7:30am',
    phoneAnswerDifficulty: 2,
  },
  {
    clinicId: CLINIC_IDS.COLUMBIA_FQHC,
    serviceType: 'EXAM',
    insuranceType: 'MEDICAID',
    nextAvailableDaysEstimate: 3,
    bestCallTimes: 'Mon-Fri 7:30-9am',
    phoneAnswerDifficulty: 2,
  },

  // Rockville Private: Fast for private, moderate for Medicaid
  {
    clinicId: CLINIC_IDS.ROCKVILLE_PRIVATE,
    serviceType: 'EXAM',
    insuranceType: 'MEDICAID',
    nextAvailableDaysEstimate: 10,
    bestCallTimes: 'Mon-Fri 8-11am',
    phoneAnswerDifficulty: 1,
  },
  {
    clinicId: CLINIC_IDS.ROCKVILLE_PRIVATE,
    serviceType: 'EXAM',
    insuranceType: 'PRIVATE',
    nextAvailableDaysEstimate: 3,
    bestCallTimes: 'Mon-Fri 8-11am',
    phoneAnswerDifficulty: 1,
  },

  // Waldorf FQHC: Moderate waits
  {
    clinicId: CLINIC_IDS.WALDORF_FQHC,
    serviceType: 'EXAM',
    insuranceType: null,
    nextAvailableDaysEstimate: 7,
    bestCallTimes: 'Mon-Fri 8-10am',
    phoneAnswerDifficulty: 2,
  },
  {
    clinicId: CLINIC_IDS.WALDORF_FQHC,
    serviceType: 'EMERGENCY_VISIT',
    insuranceType: null,
    nextAvailableDaysEstimate: 1,
    bestCallTimes: 'Mon-Fri 8am',
    phoneAnswerDifficulty: 2,
  },

  // Dundalk County HD: Moderate waits
  {
    clinicId: CLINIC_IDS.DUNDALK_COUNTY_HD,
    serviceType: 'EXAM',
    insuranceType: null,
    nextAvailableDaysEstimate: 10,
    bestCallTimes: 'Mon 8am',
    phoneAnswerDifficulty: 3,
  },
  {
    clinicId: CLINIC_IDS.DUNDALK_COUNTY_HD,
    serviceType: 'EMERGENCY_VISIT',
    insuranceType: null,
    nextAvailableDaysEstimate: 0,
    bestCallTimes: 'Mon 8am',
    phoneAnswerDifficulty: 3,
  },
]
