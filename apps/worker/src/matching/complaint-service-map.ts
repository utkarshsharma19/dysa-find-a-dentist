import type { ChiefComplaint, ServiceType } from './types.js'

export interface ComplaintServiceMapping {
  primary: ServiceType[]
  secondary: ServiceType[]
}

export const COMPLAINT_SERVICE_MAP: Record<ChiefComplaint, ComplaintServiceMapping> = {
  PAIN: {
    primary: ['EMERGENCY_VISIT', 'EXAM'],
    secondary: ['XRAY', 'FILLING', 'ROOT_CANAL', 'EXTRACTION_SIMPLE'],
  },
  SWELLING: {
    primary: ['EMERGENCY_VISIT', 'ABSCESS_DRAINAGE'],
    secondary: ['EXAM', 'XRAY', 'PRESCRIPTION_ONLY'],
  },
  BROKEN_CHIPPED_TOOTH: {
    primary: ['EXAM', 'FILLING', 'CROWN'],
    secondary: ['XRAY', 'EMERGENCY_VISIT'],
  },
  TOOTH_KNOCKED_OUT: {
    primary: ['EMERGENCY_VISIT'],
    secondary: ['EXAM', 'XRAY'],
  },
  NEED_TOOTH_PULLED: {
    primary: ['EXTRACTION_SIMPLE', 'EXTRACTION_SURGICAL'],
    secondary: ['EXAM', 'XRAY'],
  },
  FILLING_CROWN_FELL_OUT: {
    primary: ['FILLING', 'CROWN'],
    secondary: ['EXAM', 'XRAY'],
  },
  BUMP_ON_GUM: {
    primary: ['EXAM', 'ABSCESS_DRAINAGE'],
    secondary: ['XRAY', 'PRESCRIPTION_ONLY'],
  },
  CLEANING_CHECKUP: {
    primary: ['CLEANING', 'EXAM'],
    secondary: ['XRAY'],
  },
  DENTURES: {
    primary: ['DENTURE_FULL', 'DENTURE_PARTIAL'],
    secondary: ['EXAM', 'XRAY', 'EXTRACTION_SIMPLE'],
  },
  NOT_SURE: {
    primary: ['EXAM'],
    secondary: ['XRAY', 'CLEANING'],
  },
}
