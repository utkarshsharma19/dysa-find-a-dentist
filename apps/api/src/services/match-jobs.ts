import { matchJobs } from '@dysa/db'
import { eq } from 'drizzle-orm'
import { getDb } from '../db.js'

export async function enqueueMatchJob(sessionId: string) {
  const db = getDb()

  // Idempotent: check if an active job already exists for this session
  const existing = await db
    .select({ id: matchJobs.id, status: matchJobs.status })
    .from(matchJobs)
    .where(eq(matchJobs.sessionId, sessionId))
    .limit(1)

  if (existing.length > 0) {
    return { matchJobId: existing[0].id, alreadyExists: true }
  }

  const [job] = await db
    .insert(matchJobs)
    .values({
      sessionId,
      status: 'queued',
    })
    .returning({ id: matchJobs.id })

  return { matchJobId: job.id, alreadyExists: false }
}
