import { CLINIC_IDS } from './clinics.js'

/** Day of week: 0=Sunday, 1=Monday, ... 6=Saturday */
function weekdayHours(clinicId: string, open: string, close: string) {
  return [1, 2, 3, 4, 5].map((day) => ({
    clinicId,
    dayOfWeek: day,
    openTime: open,
    closeTime: close,
    isWalkInHours: false,
  }))
}

function walkInHours(clinicId: string, days: number[], start: string, end: string) {
  return days.map((day) => ({
    clinicId,
    dayOfWeek: day,
    openTime: start,
    closeTime: end,
    isWalkInHours: true,
    walkInStart: start,
    walkInEnd: end,
  }))
}

export const clinicHoursData = [
  // Baltimore FQHC: M-F 8-5, walk-ins M-W mornings
  ...weekdayHours(CLINIC_IDS.BALTIMORE_FQHC, '08:00', '17:00'),
  ...walkInHours(CLINIC_IDS.BALTIMORE_FQHC, [1, 2, 3], '08:00', '11:00'),

  // UMD Dental School: M-F 9-4 (student clinic hours)
  ...weekdayHours(CLINIC_IDS.UMD_DENTAL_SCHOOL, '09:00', '16:00'),

  // Silver Spring Free Clinic: Tue & Thu evenings only
  {
    clinicId: CLINIC_IDS.SILVER_SPRING_FREE,
    dayOfWeek: 2,
    openTime: '17:00',
    closeTime: '21:00',
    isWalkInHours: false,
  },
  {
    clinicId: CLINIC_IDS.SILVER_SPRING_FREE,
    dayOfWeek: 4,
    openTime: '17:00',
    closeTime: '21:00',
    isWalkInHours: false,
  },

  // Annapolis Private: M-F 8-5, Sat 9-1
  ...weekdayHours(CLINIC_IDS.ANNAPOLIS_PRIVATE, '08:00', '17:00'),
  {
    clinicId: CLINIC_IDS.ANNAPOLIS_PRIVATE,
    dayOfWeek: 6,
    openTime: '09:00',
    closeTime: '13:00',
    isWalkInHours: false,
  },

  // Frederick County HD: M-F 8:30-4:30
  ...weekdayHours(CLINIC_IDS.FREDERICK_COUNTY_HD, '08:30', '16:30'),

  // Towson Hospital ED: 24/7
  ...[0, 1, 2, 3, 4, 5, 6].map((day) => ({
    clinicId: CLINIC_IDS.TOWSON_HOSPITAL_ED,
    dayOfWeek: day,
    openTime: '00:00',
    closeTime: '23:59',
    isWalkInHours: true,
    walkInStart: '00:00',
    walkInEnd: '23:59',
  })),

  // PG Mobile Unit: Wed & Fri 9-3
  {
    clinicId: CLINIC_IDS.PG_MOBILE_UNIT,
    dayOfWeek: 3,
    openTime: '09:00',
    closeTime: '15:00',
    isWalkInHours: true,
    walkInStart: '09:00',
    walkInEnd: '15:00',
  },
  {
    clinicId: CLINIC_IDS.PG_MOBILE_UNIT,
    dayOfWeek: 5,
    openTime: '09:00',
    closeTime: '15:00',
    isWalkInHours: true,
    walkInStart: '09:00',
    walkInEnd: '15:00',
  },

  // Columbia FQHC: M-F 7:30-6, walk-ins daily
  ...weekdayHours(CLINIC_IDS.COLUMBIA_FQHC, '07:30', '18:00'),
  ...walkInHours(CLINIC_IDS.COLUMBIA_FQHC, [1, 2, 3, 4, 5], '07:30', '10:00'),

  // Hagerstown Nonprofit: M-Th 9-4
  ...[1, 2, 3, 4].map((day) => ({
    clinicId: CLINIC_IDS.HAGERSTOWN_NONPROFIT,
    dayOfWeek: day,
    openTime: '09:00',
    closeTime: '16:00',
    isWalkInHours: false,
  })),

  // Rockville Private: M-F 8-6, Sat 9-2
  ...weekdayHours(CLINIC_IDS.ROCKVILLE_PRIVATE, '08:00', '18:00'),
  {
    clinicId: CLINIC_IDS.ROCKVILLE_PRIVATE,
    dayOfWeek: 6,
    openTime: '09:00',
    closeTime: '14:00',
    isWalkInHours: false,
  },

  // Salisbury Free: Mon & Wed 9-3
  {
    clinicId: CLINIC_IDS.SALISBURY_FREE,
    dayOfWeek: 1,
    openTime: '09:00',
    closeTime: '15:00',
    isWalkInHours: false,
  },
  {
    clinicId: CLINIC_IDS.SALISBURY_FREE,
    dayOfWeek: 3,
    openTime: '09:00',
    closeTime: '15:00',
    isWalkInHours: false,
  },

  // Waldorf FQHC: M-F 8-5
  ...weekdayHours(CLINIC_IDS.WALDORF_FQHC, '08:00', '17:00'),

  // Bethesda Hospital Clinic: M-F 8-4:30
  ...weekdayHours(CLINIC_IDS.BETHESDA_HOSPITAL_CLINIC, '08:00', '16:30'),

  // Bowie Private: M-F 9-5
  ...weekdayHours(CLINIC_IDS.BOWIE_PRIVATE_FULL, '09:00', '17:00'),

  // Dundalk County HD: M-F 8-4, walk-ins Mon
  ...weekdayHours(CLINIC_IDS.DUNDALK_COUNTY_HD, '08:00', '16:00'),
  ...walkInHours(CLINIC_IDS.DUNDALK_COUNTY_HD, [1], '08:00', '11:00'),
]
