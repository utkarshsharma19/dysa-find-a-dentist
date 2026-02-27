import type { FastifyInstance } from 'fastify'
import { recommendations, clinics } from '@dysa/db'
import { eq, asc } from 'drizzle-orm'
import { getDb } from '../db.js'

export async function recommendationsRoute(app: FastifyInstance) {
  app.get<{ Params: { sessionId: string } }>(
    '/sessions/:sessionId/recommendations',
    async (request, reply) => {
      const { sessionId } = request.params

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(sessionId)) {
        return reply.status(400).send({ error: 'Invalid session ID format' })
      }

      const db = getDb()

      const rows = await db
        .select({
          id: recommendations.id,
          sessionId: recommendations.sessionId,
          clinicId: recommendations.clinicId,
          rank: recommendations.rank,
          bucket: recommendations.bucket,
          scoreTotal: recommendations.scoreTotal,
          scoreEligibility: recommendations.scoreEligibility,
          scoreServiceMatch: recommendations.scoreServiceMatch,
          scoreAccess: recommendations.scoreAccess,
          scoreCost: recommendations.scoreCost,
          scoreDistance: recommendations.scoreDistance,
          scoreFreshness: recommendations.scoreFreshness,
          reasonCodes: recommendations.reasonCodes,
          displayConfidence: recommendations.displayConfidence,
          createdAt: recommendations.createdAt,
          clinicName: clinics.name,
          clinicType: clinics.clinicType,
          clinicAddress: clinics.address,
          clinicCity: clinics.city,
          clinicState: clinics.state,
          clinicZip: clinics.zip,
          clinicCounty: clinics.county,
          clinicPhone: clinics.phone,
          clinicWebsiteUrl: clinics.websiteUrl,
          clinicLanguages: clinics.languagesAvailable,
          clinicAdaAccessible: clinics.adaAccessible,
          clinicParkingAvailable: clinics.parkingAvailable,
          clinicNearTransitStop: clinics.nearTransitStop,
        })
        .from(recommendations)
        .innerJoin(clinics, eq(recommendations.clinicId, clinics.id))
        .where(eq(recommendations.sessionId, sessionId))
        .orderBy(asc(recommendations.rank))

      return reply.send({ recommendations: rows })
    },
  )
}
