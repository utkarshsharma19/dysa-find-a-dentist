import { pgEnum } from 'drizzle-orm/pg-core'

// ── Core enums ──

export const yesNoUnknown = pgEnum('yes_no_unknown', ['YES', 'NO', 'UNKNOWN'])

export const clinicType = pgEnum('clinic_type', [
  'FQHC',
  'DENTAL_SCHOOL',
  'NONPROFIT',
  'FREE_CLINIC',
  'HOSPITAL_ED',
  'HOSPITAL_CLINIC',
  'MOBILE_UNIT',
  'PRIVATE_MEDICAID',
  'COUNTY_HEALTH_DEPT',
  'OTHER',
])

export const chiefComplaint = pgEnum('chief_complaint', [
  'PAIN',
  'SWELLING',
  'BROKEN_CHIPPED_TOOTH',
  'TOOTH_KNOCKED_OUT',
  'NEED_TOOTH_PULLED',
  'FILLING_CROWN_FELL_OUT',
  'BUMP_ON_GUM',
  'CLEANING_CHECKUP',
  'DENTURES',
  'NOT_SURE',
])

export const insuranceType = pgEnum('insurance_type', [
  'MEDICAID',
  'MEDICARE',
  'DUAL_MEDICAID_MEDICARE',
  'PRIVATE',
  'UNINSURED_SELF_PAY',
  'NOT_SURE',
])

export const medicaidPlan = pgEnum('medicaid_plan', [
  'PRIORITY_PARTNERS',
  'AMERIGROUP',
  'MARYLAND_PHYSICIANS_CARE',
  'JAI_MEDICAL',
  'MEDSTAR_FAMILY_CHOICE',
  'UNITED_HEALTHCARE',
  'WELLPOINT',
  'OTHER',
  'UNSURE',
])

export const urgencyLevel = pgEnum('urgency_level', [
  'TODAY',
  'WITHIN_3_DAYS',
  'WITHIN_2_WEEKS',
  'JUST_EXPLORING',
])

export const budgetBand = pgEnum('budget_band', [
  'FREE_ONLY',
  'UNDER_50',
  '50_TO_150',
  '150_PLUS',
  'NOT_SURE',
])

export const travelMode = pgEnum('travel_mode', [
  'DRIVES',
  'PUBLIC_TRANSIT',
  'WALK_ONLY',
  'RIDE_FROM_SOMEONE',
  'NOT_SURE',
])

export const travelTime = pgEnum('travel_time', [
  'UP_TO_15_MIN',
  'UP_TO_30_MIN',
  'UP_TO_60_MIN',
  'ANY_DISTANCE',
])

export const languagePreference = pgEnum('language_preference', [
  'ENGLISH',
  'SPANISH',
  'AMHARIC',
  'FRENCH',
  'KOREAN',
  'CHINESE',
  'ARABIC',
  'OTHER',
  'NO_PREFERENCE',
])

export const serviceType = pgEnum('service_type', [
  'EXAM',
  'XRAY',
  'CLEANING',
  'FILLING',
  'EXTRACTION_SIMPLE',
  'EXTRACTION_SURGICAL',
  'ROOT_CANAL',
  'CROWN',
  'DENTURE_FULL',
  'DENTURE_PARTIAL',
  'EMERGENCY_VISIT',
  'ABSCESS_DRAINAGE',
  'PRESCRIPTION_ONLY',
])

export const eligibilityStatus = pgEnum('eligibility_status', ['YES', 'NO', 'LIMITED', 'UNKNOWN'])

export const outcomeResult = pgEnum('outcome_result', [
  'TREATED_SAME_DAY',
  'GOT_APPOINTMENT',
  'WAITLISTED',
  'REFERRED_ELSEWHERE',
  'TREATED_BUT_INCOMPLETE',
  'TURNED_AWAY_INSURANCE',
  'TURNED_AWAY_WRONG_MCO',
  'TURNED_AWAY_NOT_ACCEPTING_NEW',
  'TURNED_AWAY_PAPERWORK',
  'TURNED_AWAY_COST_TOO_HIGH',
  'TOLD_TO_CALL_BACK',
  'LANGUAGE_BARRIER',
  'WRONG_INFO',
  'OTHER',
])

export const reachability = pgEnum('reachability', [
  'ANSWERED_QUICKLY',
  'ANSWERED_LONG_WAIT',
  'VOICEMAIL',
  'NO_ANSWER',
  'PHONE_DISCONNECTED',
  'UNKNOWN',
])

export const residencyRequirement = pgEnum('residency_requirement', [
  'NONE',
  'COUNTY_ONLY',
  'STATE_ONLY',
  'CATCHMENT_AREA',
  'UNKNOWN',
])

export const pricingModel = pgEnum('pricing_model', [
  'FLAT',
  'SLIDING_SCALE',
  'DONATION_BASED',
  'MEDICAID_RATE',
  'VARIES',
  'UNKNOWN',
])

export const dataConfidence = pgEnum('data_confidence', [
  'VERIFIED_RECENTLY',
  'VERIFIED_OLD',
  'USER_REPORTED',
  'ESTIMATED',
  'UNKNOWN',
])

export const attemptChannel = pgEnum('attempt_channel', ['PHONE', 'ONLINE', 'WALK_IN'])

export const reportedVia = pgEnum('reported_via', ['WEB', 'SMS', 'EMAIL', 'PASSIVE'])

export const triageAction = pgEnum('triage_action', [
  'ROUTE_TO_ED',
  'SHOW_WARNING',
  'BOOST_URGENCY',
  'ALLOW_NORMAL',
])

export const intakeChannelType = pgEnum('intake_channel_type', [
  'PHONE',
  'ONLINE_PORTAL',
  'WALK_IN',
  'REFERRAL_ONLY',
  'APP',
])

export const sourceType = pgEnum('source_type', [
  'WEBSITE_SCRAPE',
  'PHONE_VERIFICATION',
  'IN_PERSON_VISIT',
  'USER_OUTCOME_REPORT',
  'PARTNER_DATA_FEED',
  'MEDICAID_DIRECTORY',
  'HRSA_DATA',
  'STAFF_ENTRY',
  'OTHER',
])

export const notificationType = pgEnum('notification_type', [
  'BACKUP_OPTIONS',
  'FOLLOWUP_CHECK',
  'REMINDER',
  'RED_FLAG_WARNING',
])

export const notificationChannel = pgEnum('notification_channel', ['SMS', 'EMAIL'])

export const deliveryStatus = pgEnum('delivery_status', ['SENT', 'FAILED', 'DELIVERED', 'UNKNOWN'])
