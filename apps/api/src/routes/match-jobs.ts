import type { FastifyInstance } from 'fastify'
import { matchJobs } from '@dysa/db'
import { eq } from 'drizzle-orm'
import { getDb } from '../db.js'

export async function matchJobsRoute(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>('/match-jobs/:id', async (request, reply) => {
    const { id } = request.params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return reply.status(400).send({ error: 'Invalid match job ID format' })
    }

    const [job] = await getDb()
      .select({
        id: matchJobs.id,
        sessionId: matchJobs.sessionId,
        status: matchJobs.status,
        queuedAt: matchJobs.queuedAt,
        startedAt: matchJobs.startedAt,
        completedAt: matchJobs.completedAt,
        failedAt: matchJobs.failedAt,
        errorMessage: matchJobs.errorMessage,
      })
      .from(matchJobs)
      .where(eq(matchJobs.id, id))
      .limit(1)

    if (!job) {
      return reply.status(404).send({ error: 'Match job not found' })
    }

    return reply.send(job)
  })
}
