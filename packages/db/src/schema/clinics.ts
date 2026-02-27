import {
  pgTable,
  uuid,
  text,
  boolean,
  doublePrecision,
  smallint,
  time,
  numeric,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core'
import {
  clinicType,
  yesNoUnknown,
  dataConfidence,
  serviceType,
  eligibilityStatus,
  medicaidPlan,
  residencyRequirement,
  insuranceType,
  pricingModel,
  intakeChannelType,
  sourceType,
} from './enums'

// ── clinics ──

export const clinics = pgTable(
  'clinics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    clinicType: clinicType('clinic_type').notNull().default('OTHER'),
    address: text('address'),
    city: text('city'),
    state: text('state').default('MD'),
    zip: text('zip'),
    county: text('county'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    phone: text('phone'),
    phoneSecondary: text('phone_secondary'),
    websiteUrl: text('website_url'),
    intakeUrl: text('intake_url'),
    active: boolean('active').notNull().default(true),
    languagesAvailable: text('languages_available').array(),
    adaAccessible: yesNoUnknown('ada_accessible').default('UNKNOWN'),
    parkingAvailable: yesNoUnknown('parking_available').default('UNKNOWN'),
    nearTransitStop: boolean('near_transit_stop').default(false),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    verificationConfidence: dataConfidence('verification_confidence').default('UNKNOWN'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    notesInternal: text('notes_internal'),
  },
  (t) => [
    index('clinics_county_idx').on(t.county),
    index('clinics_zip_idx').on(t.zip),
    index('clinics_active_idx').on(t.active),
  ],
)

// ── clinic_hours ──

export const clinicHours = pgTable(
  'clinic_hours',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    dayOfWeek: smallint('day_of_week').notNull(),
    openTime: time('open_time'),
    closeTime: time('close_time'),
    isWalkInHours: boolean('is_walk_in_hours').default(false),
    walkInStart: time('walk_in_start'),
    walkInEnd: time('walk_in_end'),
    notes: text('notes'),
  },
  (t) => [unique('clinic_hours_unique').on(t.clinicId, t.dayOfWeek, t.isWalkInHours)],
)

// ── clinic_services ──

export const clinicServices = pgTable(
  'clinic_services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    serviceType: serviceType('service_type').notNull(),
    availableForMedicaid: boolean('available_for_medicaid').default(false),
    availableForUninsured: boolean('available_for_uninsured').default(false),
    availableForPrivate: boolean('available_for_private').default(true),
    newPatientsAccepted: boolean('new_patients_accepted').default(true),
    notes: text('notes'),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
  },
  (t) => [unique('clinic_services_unique').on(t.clinicId, t.serviceType)],
)

// ── access_rules ──

export const accessRules = pgTable('access_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' })
    .unique(),
  acceptsNewAdultPatients: eligibilityStatus('accepts_new_adult_patients').default('UNKNOWN'),
  acceptsNewChildPatients: eligibilityStatus('accepts_new_child_patients').default('UNKNOWN'),
  minAgeSeen: smallint('min_age_seen'),
  maxAgeSeen: smallint('max_age_seen'),
  acceptsMedicaidAdults: eligibilityStatus('accepts_medicaid_adults').default('UNKNOWN'),
  acceptsMedicaidChildren: eligibilityStatus('accepts_medicaid_children').default('UNKNOWN'),
  medicaidPlansAccepted: medicaidPlan('medicaid_plans_accepted').array().default([]),
  acceptsMedicare: yesNoUnknown('accepts_medicare').default('UNKNOWN'),
  uninsuredWelcome: eligibilityStatus('uninsured_welcome').default('UNKNOWN'),
  slidingScaleAvailable: yesNoUnknown('sliding_scale_available').default('UNKNOWN'),
  seesEmergencyPain: eligibilityStatus('sees_emergency_pain').default('UNKNOWN'),
  seesSwelling: eligibilityStatus('sees_swelling').default('UNKNOWN'),
  walkInAllowed: eligibilityStatus('walk_in_allowed').default('UNKNOWN'),
  referralRequired: yesNoUnknown('referral_required').default('UNKNOWN'),
  residencyRequirement: residencyRequirement('residency_requirement').default('UNKNOWN'),
  residencyAreaText: text('residency_area_text'),
  documentsRequired: text('documents_required').array(),
  notesPublic: text('notes_public'),
  lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── clinic_service_rules ──

export const clinicServiceRules = pgTable(
  'clinic_service_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    serviceType: serviceType('service_type').notNull(),
    insuranceType: insuranceType('insurance_type').notNull(),
    accepts: eligibilityStatus('accepts').default('UNKNOWN'),
    newPatientsOnly: boolean('new_patients_only').default(false),
    conditionsText: text('conditions_text'),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
  },
  (t) => [unique('clinic_service_rules_unique').on(t.clinicId, t.serviceType, t.insuranceType)],
)

// ── pricing ──

export const pricing = pgTable(
  'pricing',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    serviceType: serviceType('service_type').notNull(),
    priceMin: numeric('price_min', { precision: 8, scale: 2 }),
    priceMax: numeric('price_max', { precision: 8, scale: 2 }),
    pricingModel: pricingModel('pricing_model').default('UNKNOWN'),
    conditionsText: text('conditions_text'),
    medicaidCopay: numeric('medicaid_copay', { precision: 8, scale: 2 }),
    confidence: dataConfidence('confidence').default('UNKNOWN'),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
  },
  (t) => [unique('pricing_unique').on(t.clinicId, t.serviceType)],
)

// ── access_timing ──

export const accessTiming = pgTable(
  'access_timing',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    serviceType: serviceType('service_type'),
    insuranceType: insuranceType('insurance_type'),
    nextAvailableDaysEstimate: smallint('next_available_days_estimate'),
    bestCallTimes: text('best_call_times'),
    phoneAnswerDifficulty: smallint('phone_answer_difficulty'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('access_timing_unique').on(t.clinicId, t.serviceType, t.insuranceType)],
)

// ── intake_channels ──

export const intakeChannels = pgTable(
  'intake_channels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    channel: intakeChannelType('channel').notNull(),
    detailsText: text('details_text'),
    onlineLink: text('online_link'),
  },
  (t) => [unique('intake_channels_unique').on(t.clinicId, t.channel)],
)

// ── sources ──

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  sourceType: sourceType('source_type').notNull(),
  sourceUrl: text('source_url'),
  rawNotes: text('raw_notes'),
  verifiedFields: text('verified_fields').array(),
  capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  capturedBy: text('captured_by'),
})

// ── clinic_access_snapshots ──

export const clinicAccessSnapshots = pgTable(
  'clinic_access_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    snapshotDate: timestamp('snapshot_date', { mode: 'date' }).notNull().defaultNow(),
    sourceId: uuid('source_id').references(() => sources.id),
    acceptingNewAdultMedicaid: eligibilityStatus('accepting_new_adult_medicaid'),
    walkInAvailable: eligibilityStatus('walk_in_available'),
    estimatedWaitDays: smallint('estimated_wait_days'),
    phoneReachable: yesNoUnknown('phone_reachable'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('snapshots_clinic_date_idx').on(t.clinicId, t.snapshotDate)],
)
