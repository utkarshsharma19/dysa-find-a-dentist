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

interface ClinicServiceRow {
  clinicId: string
  serviceType: ServiceType
  availableForMedicaid: boolean
  availableForUninsured: boolean
  availableForPrivate: boolean
  newPatientsAccepted: boolean
  lastVerifiedAt?: Date
}

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

function fullServices(
  clinicId: string,
  medicaid: boolean,
  uninsured: boolean,
  lastVerified: Date,
): ClinicServiceRow[] {
  const services: ServiceType[] = [
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
  return services.map((s) => ({
    clinicId,
    serviceType: s,
    availableForMedicaid: medicaid,
    availableForUninsured: uninsured,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: lastVerified,
  }))
}

export const clinicServicesData: ClinicServiceRow[] = [
  // Baltimore FQHC: Full services, Medicaid + uninsured
  ...fullServices(CLINIC_IDS.BALTIMORE_FQHC, true, true, thirtyDaysAgo),
  {
    clinicId: CLINIC_IDS.BALTIMORE_FQHC,
    serviceType: 'EXTRACTION_SURGICAL',
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: thirtyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.BALTIMORE_FQHC,
    serviceType: 'DENTURE_FULL',
    availableForMedicaid: true,
    availableForUninsured: false,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: thirtyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.BALTIMORE_FQHC,
    serviceType: 'DENTURE_PARTIAL',
    availableForMedicaid: true,
    availableForUninsured: false,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: thirtyDaysAgo,
  },

  // UMD Dental School: Full services, all insurance, long waits
  ...fullServices(CLINIC_IDS.UMD_DENTAL_SCHOOL, true, true, ninetyDaysAgo),
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'EXTRACTION_SURGICAL',
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'DENTURE_FULL',
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: ninetyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.UMD_DENTAL_SCHOOL,
    serviceType: 'DENTURE_PARTIAL',
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: ninetyDaysAgo,
  },

  // Silver Spring Free: Basic services only, uninsured only
  ...(
    [
      'EXAM',
      'XRAY',
      'CLEANING',
      'FILLING',
      'EXTRACTION_SIMPLE',
      'PRESCRIPTION_ONLY',
    ] as ServiceType[]
  ).map((s) => ({
    clinicId: CLINIC_IDS.SILVER_SPRING_FREE,
    serviceType: s,
    availableForMedicaid: false,
    availableForUninsured: true,
    availableForPrivate: false,
    newPatientsAccepted: true,
    lastVerifiedAt: ninetyDaysAgo,
  })),

  // Annapolis Private: Most services, Medicaid + private (no uninsured)
  ...fullServices(CLINIC_IDS.ANNAPOLIS_PRIVATE, true, false, thirtyDaysAgo),

  // Frederick County HD: Basic + emergency, Medicaid + uninsured
  ...(
    [
      'EXAM',
      'XRAY',
      'CLEANING',
      'FILLING',
      'EXTRACTION_SIMPLE',
      'EMERGENCY_VISIT',
      'ABSCESS_DRAINAGE',
      'PRESCRIPTION_ONLY',
    ] as ServiceType[]
  ).map((s) => ({
    clinicId: CLINIC_IDS.FREDERICK_COUNTY_HD,
    serviceType: s,
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: ninetyDaysAgo,
  })),

  // Towson Hospital ED: Emergency only
  ...(
    ['EMERGENCY_VISIT', 'ABSCESS_DRAINAGE', 'PRESCRIPTION_ONLY', 'EXAM', 'XRAY'] as ServiceType[]
  ).map((s) => ({
    clinicId: CLINIC_IDS.TOWSON_HOSPITAL_ED,
    serviceType: s,
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: thirtyDaysAgo,
  })),

  // PG Mobile Unit: Basic services, free for uninsured
  ...(
    [
      'EXAM',
      'XRAY',
      'CLEANING',
      'FILLING',
      'EXTRACTION_SIMPLE',
      'PRESCRIPTION_ONLY',
    ] as ServiceType[]
  ).map((s) => ({
    clinicId: CLINIC_IDS.PG_MOBILE_UNIT,
    serviceType: s,
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: false,
    newPatientsAccepted: true,
  })),

  // Columbia FQHC: Full services
  ...fullServices(CLINIC_IDS.COLUMBIA_FQHC, true, true, thirtyDaysAgo),
  {
    clinicId: CLINIC_IDS.COLUMBIA_FQHC,
    serviceType: 'DENTURE_FULL',
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: thirtyDaysAgo,
  },
  {
    clinicId: CLINIC_IDS.COLUMBIA_FQHC,
    serviceType: 'DENTURE_PARTIAL',
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: thirtyDaysAgo,
  },

  // Hagerstown Nonprofit: Basic, uninsured focus
  ...(
    [
      'EXAM',
      'XRAY',
      'CLEANING',
      'FILLING',
      'EXTRACTION_SIMPLE',
      'EMERGENCY_VISIT',
      'PRESCRIPTION_ONLY',
    ] as ServiceType[]
  ).map((s) => ({
    clinicId: CLINIC_IDS.HAGERSTOWN_NONPROFIT,
    serviceType: s,
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: false,
    newPatientsAccepted: true,
  })),

  // Rockville Private: Full services, Medicaid + private
  ...fullServices(CLINIC_IDS.ROCKVILLE_PRIVATE, true, false, thirtyDaysAgo),
  {
    clinicId: CLINIC_IDS.ROCKVILLE_PRIVATE,
    serviceType: 'EXTRACTION_SURGICAL',
    availableForMedicaid: true,
    availableForUninsured: false,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: thirtyDaysAgo,
  },

  // Salisbury Free: Basic, uninsured only
  ...(['EXAM', 'XRAY', 'CLEANING', 'FILLING', 'EXTRACTION_SIMPLE'] as ServiceType[]).map((s) => ({
    clinicId: CLINIC_IDS.SALISBURY_FREE,
    serviceType: s,
    availableForMedicaid: false,
    availableForUninsured: true,
    availableForPrivate: false,
    newPatientsAccepted: true,
    lastVerifiedAt: ninetyDaysAgo,
  })),

  // Waldorf FQHC: Full services
  ...fullServices(CLINIC_IDS.WALDORF_FQHC, true, true, ninetyDaysAgo),

  // Bethesda Hospital Clinic: Full services
  ...fullServices(CLINIC_IDS.BETHESDA_HOSPITAL_CLINIC, true, true, thirtyDaysAgo),
  {
    clinicId: CLINIC_IDS.BETHESDA_HOSPITAL_CLINIC,
    serviceType: 'EXTRACTION_SURGICAL',
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: thirtyDaysAgo,
  },

  // Bowie Private: Full services but NOT accepting new patients
  ...fullServices(CLINIC_IDS.BOWIE_PRIVATE_FULL, true, false, thirtyDaysAgo).map((s) => ({
    ...s,
    newPatientsAccepted: false,
  })),

  // Dundalk County HD: Basic + emergency
  ...(
    [
      'EXAM',
      'XRAY',
      'CLEANING',
      'FILLING',
      'EXTRACTION_SIMPLE',
      'EMERGENCY_VISIT',
      'ABSCESS_DRAINAGE',
      'PRESCRIPTION_ONLY',
    ] as ServiceType[]
  ).map((s) => ({
    clinicId: CLINIC_IDS.DUNDALK_COUNTY_HD,
    serviceType: s,
    availableForMedicaid: true,
    availableForUninsured: true,
    availableForPrivate: true,
    newPatientsAccepted: true,
    lastVerifiedAt: ninetyDaysAgo,
  })),
]
