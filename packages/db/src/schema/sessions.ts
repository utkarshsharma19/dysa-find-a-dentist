import {
  pgTable,
  uuid,
  text,
  boolean,
  doublePrecision,
  smallint,
  numeric,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import {
  chiefComplaint,
  insuranceType,
  medicaidPlan,
  urgencyLevel,
  budgetBand,
  travelMode,
  travelTime,
  languagePreference,
  triageAction,
  attemptChannel,
  reachability,
  outcomeResult,
  reportedVia,
  notificationType,
  notificationChannel,
  deliveryStatus,
} from './enums'
import { clinics } from './clinics'

// ── sessions ──

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    zip: text('zip'),
    countyInferred: text('county_inferred'),
    latRound: doublePrecision('lat_round'),
    lngRound: doublePrecision('lng_round'),
    chiefComplaint: chiefComplaint('chief_complaint').notNull(),
    insuranceType: insuranceType('insurance_type').notNull(),
    medicaidPlan: medicaidPlan('medicaid_plan'),
    urgency: urgencyLevel('urgency').notNull(),
    budgetBand: budgetBand('budget_band'),
    travelMode: travelMode('travel_mode'),
    travelTime: travelTime('travel_time'),
    languagePreference: languagePreference('language_preference').default('ENGLISH'),
    hasFever: boolean('has_fever'),
    hasFacialSwelling: boolean('has_facial_swelling'),
    difficultySwallowingBreathing: boolean('difficulty_swallowing_breathing'),
    triageActionTaken: triageAction('triage_action_taken'),
    userAgent: text('user_agent'),
    referralSource: text('referral_source'),
  },
  (t) => [
    index('sessions_created_at_idx').on(t.createdAt),
    index('sessions_county_idx').on(t.countyInferred),
    index('sessions_complaint_idx').on(t.chiefComplaint),
  ],
)

// ── recommendations ──

export const recommendations = pgTable(
  'recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id),
    rank: smallint('rank').notNull(),
    bucket: text('bucket').notNull(),
    scoreTotal: numeric('score_total', { precision: 5, scale: 3 }),
    scoreEligibility: numeric('score_eligibility', { precision: 5, scale: 3 }),
    scoreServiceMatch: numeric('score_service_match', { precision: 5, scale: 3 }),
    scoreAccess: numeric('score_access', { precision: 5, scale: 3 }),
    scoreCost: numeric('score_cost', { precision: 5, scale: 3 }),
    scoreDistance: numeric('score_distance', { precision: 5, scale: 3 }),
    scoreFreshness: numeric('score_freshness', { precision: 5, scale: 3 }),
    reasonCodes: jsonb('reason_codes'),
    displayConfidence: text('display_confidence'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('recommendations_session_idx').on(t.sessionId),
    index('recommendations_clinic_idx').on(t.clinicId),
  ],
)

// ── outcomes ──

export const outcomes = pgTable(
  'outcomes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
    clinicId: uuid('clinic_id').references(() => clinics.id),
    recommendationId: uuid('recommendation_id').references(() => recommendations.id),
    attemptChannel: attemptChannel('attempt_channel'),
    reachability: reachability('reachability'),
    result: outcomeResult('result'),
    costPaid: numeric('cost_paid', { precision: 8, scale: 2 }),
    referredToClinicId: uuid('referred_to_clinic_id').references(() => clinics.id),
    waitTimeActualDays: smallint('wait_time_actual_days'),
    notes: text('notes'),
    reportedVia: reportedVia('reported_via'),
    dataQualityFlag: text('data_quality_flag').default('UNVERIFIED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('outcomes_clinic_idx').on(t.clinicId),
    index('outcomes_result_idx').on(t.result),
    index('outcomes_created_at_idx').on(t.createdAt),
  ],
)

// ── behavior_events ──

export const behaviorEvents = pgTable(
  'behavior_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
    eventType: text('event_type').notNull(),
    clinicId: uuid('clinic_id').references(() => clinics.id),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('behavior_events_session_idx').on(t.sessionId)],
)

// ── contact_preferences ──

export const contactPreferences = pgTable('contact_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' })
    .unique(),
  phoneEncrypted: text('phone_encrypted'),
  emailEncrypted: text('email_encrypted'),
  allowSmsBackup: boolean('allow_sms_backup').default(false),
  allowEmailBackup: boolean('allow_email_backup').default(false),
  allowFollowupQuestions: boolean('allow_followup_questions').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── notifications_sent ──

export const notificationsSent = pgTable('notifications_sent', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
  clinicId: uuid('clinic_id').references(() => clinics.id),
  notificationType: notificationType('notification_type').notNull(),
  channel: notificationChannel('channel').notNull(),
  messageContentHash: text('message_content_hash'),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  deliveryStatus: deliveryStatus('delivery_status').default('UNKNOWN'),
})
