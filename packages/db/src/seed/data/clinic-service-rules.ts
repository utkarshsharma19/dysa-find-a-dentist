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
type EligibilityStatus = 'YES' | 'NO' | 'LIMITED' | 'UNKNOWN'

interface ServiceRuleRow {
  clinicId: string
  serviceType: ServiceType
  insuranceType: InsuranceType
  accepts: EligibilityStatus
  conditionsText?: string
}

export const clinicServiceRulesData: ServiceRuleRow[] = [
  // Annapolis Private: No ROOT_CANAL for Medicaid
  {
    clinicId: CLINIC_IDS.ANNAPOLIS_PRIVATE,
    serviceType: 'ROOT_CANAL',
    insuranceType: 'MEDICAID',
    accepts: 'NO',
    conditionsText: 'Root canals not covered under Medicaid at this location',
  },
  // Annapolis Private: No CROWN for Medicaid
  {
    clinicId: CLINIC_IDS.ANNAPOLIS_PRIVATE,
    serviceType: 'CROWN',
    insuranceType: 'MEDICAID',
    accepts: 'NO',
    conditionsText: 'Crowns not covered under Medicaid at this location',
  },
  // Rockville Private: Limited surgical extractions for Medicaid
  {
    clinicId: CLINIC_IDS.ROCKVILLE_PRIVATE,
    serviceType: 'EXTRACTION_SURGICAL',
    insuranceType: 'MEDICAID',
    accepts: 'LIMITED',
    conditionsText: 'Prior authorization required for surgical extractions',
  },
  // Towson ED: No cleaning or filling (ED only)
  {
    clinicId: CLINIC_IDS.TOWSON_HOSPITAL_ED,
    serviceType: 'CLEANING',
    insuranceType: 'MEDICAID',
    accepts: 'NO',
  },
  {
    clinicId: CLINIC_IDS.TOWSON_HOSPITAL_ED,
    serviceType: 'CLEANING',
    insuranceType: 'UNINSURED_SELF_PAY',
    accepts: 'NO',
  },
  {
    clinicId: CLINIC_IDS.TOWSON_HOSPITAL_ED,
    serviceType: 'FILLING',
    insuranceType: 'MEDICAID',
    accepts: 'NO',
  },
  {
    clinicId: CLINIC_IDS.TOWSON_HOSPITAL_ED,
    serviceType: 'FILLING',
    insuranceType: 'UNINSURED_SELF_PAY',
    accepts: 'NO',
  },
  // Bethesda Hospital Clinic: Surgical extraction needs referral
  {
    clinicId: CLINIC_IDS.BETHESDA_HOSPITAL_CLINIC,
    serviceType: 'EXTRACTION_SURGICAL',
    insuranceType: 'MEDICAID',
    accepts: 'LIMITED',
    conditionsText: 'Requires oral surgery referral',
  },
]
