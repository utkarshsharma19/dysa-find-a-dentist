import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { chiefComplaint, triageAction } from './enums'

export const triageRedFlags = pgTable('triage_red_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  complaintTrigger: chiefComplaint('complaint_trigger').notNull(),
  requiresFever: boolean('requires_fever').default(false),
  requiresFacialSwelling: boolean('requires_facial_swelling').default(false),
  requiresDifficultyBreathing: boolean('requires_difficulty_breathing').default(false),
  action: triageAction('action').notNull(),
  messageTitle: text('message_title').notNull(),
  messageBody: text('message_body').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
