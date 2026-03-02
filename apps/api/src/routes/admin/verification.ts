import type { FastifyInstance } from 'fastify'
import { sql, lt, isNull, or, count } from 'drizzle-orm'
import { clinics, sources } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminVerificationRoute(app: FastifyInstance) {
  app.addHook('onRequest', app.verifyAdmin)

  // Get verification queue — clinics needing re-verification
  app.get('/admin/verification', async (request) => {
    const { page = 1, pageSize = 25 } = request.query as {
      page?: number
      pageSize?: number
    }

    const db = getDb()
    const offset = (Number(page) - 1) * Number(pageSize)
    const limit = Math.min(Number(pageSize), 100)

    // Clinics that are active and either never verified or verified > 90 days ago
    const staleThreshold = new Date()
    staleThreshold.setDate(staleThreshold.getDate() - 90)

    const staleCondition = or(
      isNull(clinics.lastVerifiedAt),
      lt(clinics.lastVerifiedAt, staleThreshold),
    )

    const [data, [{ total }]] = await Promise.all([
      db
        .select({
          id: clinics.id,
          name: clinics.name,
          clinicType: clinics.clinicType,
          city: clinics.city,
          county: clinics.county,
          phone: clinics.phone,
          lastVerifiedAt: clinics.lastVerifiedAt,
          verificationConfidence: clinics.verificationConfidence,
        })
        .from(clinics)
        .where(sql`${clinics.active} = true AND (${staleCondition})`)
        .orderBy(clinics.lastVerifiedAt)
        .offset(offset)
        .limit(limit),
      db
        .select({ total: count() })
        .from(clinics)
        .where(sql`${clinics.active} = true AND (${staleCondition})`),
    ])

    return { data, total, page: Number(page), pageSize: limit }
  })

  // Get recent sources for a clinic (audit trail)
  app.get('/admin/verification/:clinicId/history', async (request) => {
    const { clinicId } = request.params as { clinicId: string }
    const db = getDb()

    const data = await db
      .select()
      .from(sources)
      .where(sql`${sources.clinicId} = ${clinicId}`)
      .orderBy(sql`${sources.capturedAt} DESC`)
      .limit(50)

    return { data }
  })
}
