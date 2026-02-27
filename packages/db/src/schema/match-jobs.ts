import { pgTable, uuid, text, smallint, timestamp, jsonb, index } from 'drizzle-orm/pg-core'
import { sessions } from './sessions'

export const matchJobs = pgTable(
  'match_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' })
      .unique(),
    status: text('status').notNull().default('queued'),
    attempts: smallint('attempts').notNull().default(0),
    errorMessage: text('error_message'),
    debugPayload: jsonb('debug_payload'),
    queuedAt: timestamp('queued_at', { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
  },
  (t) => [
    index('match_jobs_session_idx').on(t.sessionId),
    index('match_jobs_status_idx').on(t.status),
  ],
)
