import type { FastifyInstance } from 'fastify'
import { CreateSessionSchema } from '@dysa/shared'
import { sessions } from '@dysa/db'
import { getDb } from '../db.js'
import { evaluateTriage } from '../services/triage.js'
import { enqueueMatchJob } from '../services/match-jobs.js'

function roundCoordinate(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export async function sessionsRoute(app: FastifyInstance) {
  app.post('/sessions', async (request, reply) => {
    const parsed = CreateSessionSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      })
    }

    const input = parsed.data

    // Evaluate triage BEFORE storing session
    const triage = evaluateTriage(input)

    // Round lat/lng for privacy (~1.1km / 0.7mi precision)
    const latRound = input.lat != null ? roundCoordinate(input.lat) : null
    const lngRound = input.lng != null ? roundCoordinate(input.lng) : null

    const [session] = await getDb()
      .insert(sessions)
      .values({
        zip: input.zip ?? null,
        latRound,
        lngRound,
        chiefComplaint: input.chiefComplaint,
        insuranceType: input.insuranceType,
        medicaidPlan: input.medicaidPlan ?? null,
        urgency: input.urgency,
        budgetBand: input.budgetBand ?? null,
        travelMode: input.travelMode ?? null,
        travelTime: input.travelTime ?? null,
        languagePreference: input.languagePreference,
        hasFever: input.hasFever ?? null,
        hasFacialSwelling: input.hasFacialSwelling ?? null,
        difficultySwallowingBreathing: input.difficultySwallowingBreathing ?? null,
        triageActionTaken: triage.action,
        referralSource: input.referralSource ?? null,
        userAgent: request.headers['user-agent'] ?? null,
      })
      .returning({ id: sessions.id, createdAt: sessions.createdAt })

    // If not blocked by triage, enqueue a match job
    let matchJobId: string | null = null
    if (!triage.blocked) {
      const result = await enqueueMatchJob(session.id)
      matchJobId = result.matchJobId
    }

    return reply.status(201).send({
      sessionId: session.id,
      createdAt: session.createdAt,
      matchJobId,
      triage: {
        action: triage.action,
        blocked: triage.blocked,
        messageTitle: triage.messageTitle,
        messageBody: triage.messageBody,
      },
    })
  })
}
