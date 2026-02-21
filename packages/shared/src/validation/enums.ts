import { z } from 'zod'

export const ChiefComplaint = z.enum([
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

export const InsuranceType = z.enum([
  'MEDICAID',
  'MEDICARE',
  'DUAL_MEDICAID_MEDICARE',
  'PRIVATE',
  'UNINSURED_SELF_PAY',
  'NOT_SURE',
])

export const MedicaidPlan = z.enum([
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

export const UrgencyLevel = z.enum(['TODAY', 'WITHIN_3_DAYS', 'WITHIN_2_WEEKS', 'JUST_EXPLORING'])

export const BudgetBand = z.enum(['FREE_ONLY', 'UNDER_50', '50_TO_150', '150_PLUS', 'NOT_SURE'])

export const TravelMode = z.enum([
  'DRIVES',
  'PUBLIC_TRANSIT',
  'WALK_ONLY',
  'RIDE_FROM_SOMEONE',
  'NOT_SURE',
])

export const TravelTime = z.enum(['UP_TO_15_MIN', 'UP_TO_30_MIN', 'UP_TO_60_MIN', 'ANY_DISTANCE'])

export const LanguagePreference = z.enum([
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

export type ChiefComplaintType = z.infer<typeof ChiefComplaint>
export type InsuranceTypeType = z.infer<typeof InsuranceType>
export type MedicaidPlanType = z.infer<typeof MedicaidPlan>
export type UrgencyLevelType = z.infer<typeof UrgencyLevel>
export type BudgetBandType = z.infer<typeof BudgetBand>
export type TravelModeType = z.infer<typeof TravelMode>
export type TravelTimeType = z.infer<typeof TravelTime>
export type LanguagePreferenceType = z.infer<typeof LanguagePreference>
