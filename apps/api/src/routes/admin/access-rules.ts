import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { accessRules } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminAccessRulesRoute(app: FastifyInstance) {
  app.addHook('onRequest', app.verifyAdmin)

  app.get('/admin/clinics/:clinicId/access-rules', async (request) => {
    const { clinicId } = request.params as { clinicId: string }
    const db = getDb()
    const [data] = await db
      .select()
      .from(accessRules)
      .where(eq(accessRules.clinicId, clinicId))
      .limit(1)
    return { data: data ?? null }
  })

  app.put('/admin/clinics/:clinicId/access-rules', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { clinicId } = request.params as { clinicId: string }
    const body = request.body as Record<string, unknown>
    const db = getDb()

    // Check if access rules exist for this clinic
    const [existing] = await db
      .select({ id: accessRules.id })
      .from(accessRules)
      .where(eq(accessRules.clinicId, clinicId))
      .limit(1)

    const values = {
      clinicId,
      acceptsNewAdultPatients:
        body.acceptsNewAdultPatients as typeof accessRules.$inferInsert.acceptsNewAdultPatients,
      acceptsNewChildPatients:
        body.acceptsNewChildPatients as typeof accessRules.$inferInsert.acceptsNewChildPatients,
      minAgeSeen: body.minAgeSeen != null ? Number(body.minAgeSeen) : null,
      maxAgeSeen: body.maxAgeSeen != null ? Number(body.maxAgeSeen) : null,
      acceptsMedicaidAdults:
        body.acceptsMedicaidAdults as typeof accessRules.$inferInsert.acceptsMedicaidAdults,
      acceptsMedicaidChildren:
        body.acceptsMedicaidChildren as typeof accessRules.$inferInsert.acceptsMedicaidChildren,
      medicaidPlansAccepted:
        (body.medicaidPlansAccepted as typeof accessRules.$inferInsert.medicaidPlansAccepted) ?? [],
      acceptsMedicare: body.acceptsMedicare as typeof accessRules.$inferInsert.acceptsMedicare,
      uninsuredWelcome: body.uninsuredWelcome as typeof accessRules.$inferInsert.uninsuredWelcome,
      slidingScaleAvailable:
        body.slidingScaleAvailable as typeof accessRules.$inferInsert.slidingScaleAvailable,
      seesEmergencyPain:
        body.seesEmergencyPain as typeof accessRules.$inferInsert.seesEmergencyPain,
      seesSwelling: body.seesSwelling as typeof accessRules.$inferInsert.seesSwelling,
      walkInAllowed: body.walkInAllowed as typeof accessRules.$inferInsert.walkInAllowed,
      referralRequired: body.referralRequired as typeof accessRules.$inferInsert.referralRequired,
      residencyRequirement:
        body.residencyRequirement as typeof accessRules.$inferInsert.residencyRequirement,
      residencyAreaText: (body.residencyAreaText as string) ?? null,
      documentsRequired: (body.documentsRequired as string[]) ?? null,
      notesPublic: (body.notesPublic as string) ?? null,
      updatedAt: new Date(),
    }

    let data
    if (existing) {
      ;[data] = await db
        .update(accessRules)
        .set(values)
        .where(eq(accessRules.clinicId, clinicId))
        .returning()
    } else {
      ;[data] = await db.insert(accessRules).values(values).returning()
    }

    return { data }
  })
}
