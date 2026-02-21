import { matchJobs } from '@dysa/db'
import { eq } from 'drizzle-orm'
import { Queue } from 'bullmq'
import {
  MATCH_QUEUE_NAME,
  MATCH_QUEUE_OPTIONS,
  getRedisConfig,
  type MatchJobData,
} from '@dysa/shared'
import { getDb } from '../db.js'

let _queue: Queue<MatchJobData> | null = null

function getQueue(): Queue<MatchJobData> {
  if (!_queue) {
    _queue = new Queue<MatchJobData>(MATCH_QUEUE_NAME, {
      connection: getRedisConfig(),
      ...MATCH_QUEUE_OPTIONS,
    })
  }
  return _queue
}

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

  // Publish to BullMQ for worker consumption
  await getQueue().add('match', {
    sessionId,
    matchJobId: job.id,
  })

  return { matchJobId: job.id, alreadyExists: false }
}
