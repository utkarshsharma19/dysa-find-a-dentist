import { Worker } from 'bullmq'
import { eq } from 'drizzle-orm'
import { matchJobs } from '@dysa/db'
import { createDb } from '@dysa/db'
import { MATCH_QUEUE_NAME, getRedisConfig, type MatchJobData } from '@dysa/shared'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const db = createDb(DATABASE_URL)

async function processMatchJob(data: MatchJobData): Promise<void> {
  const { matchJobId, sessionId } = data

  console.info(`Processing match job ${matchJobId} for session ${sessionId}`)

  // Mark as processing
  await db
    .update(matchJobs)
    .set({ status: 'processing', startedAt: new Date() })
    .where(eq(matchJobs.id, matchJobId))

  // TODO: Matching logic will be implemented in PR-BE-005 through PR-BE-007
  // For now, just mark as completed
  await db
    .update(matchJobs)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(matchJobs.id, matchJobId))

  console.info(`Match job ${matchJobId} completed`)
}

const worker = new Worker<MatchJobData>(
  MATCH_QUEUE_NAME,
  async (job) => {
    await processMatchJob(job.data)
  },
  {
    connection: getRedisConfig(),
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  },
)

worker.on('completed', (job) => {
  console.info(`Job ${job.id} completed successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('Worker error:', err)
})

console.info('Match worker started, waiting for jobs...')

// Graceful shutdown
async function shutdown() {
  console.info('Shutting down worker...')
  await worker.close()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
