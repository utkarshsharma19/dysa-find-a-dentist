import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { clinicServiceRules } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminClinicServiceRulesRoute(app: FastifyInstance) {
  app.addHook('onRequest', app.verifyAdmin)

  app.get('/admin/clinics/:clinicId/service-rules', async (request) => {
    const { clinicId } = request.params as { clinicId: string }
    const db = getDb()
    const data = await db
      .select()
      .from(clinicServiceRules)
      .where(eq(clinicServiceRules.clinicId, clinicId))
    return { data }
  })

  app.put('/admin/clinics/:clinicId/service-rules', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { clinicId } = request.params as { clinicId: string }
    const { data } = request.body as { data: Array<Record<string, unknown>> }
    const db = getDb()

    await db.delete(clinicServiceRules).where(eq(clinicServiceRules.clinicId, clinicId))

    if (data && data.length > 0) {
      await db.insert(clinicServiceRules).values(
        data.map((row) => ({
          clinicId,
          serviceType: row.serviceType as typeof clinicServiceRules.$inferInsert.serviceType,
          insuranceType: row.insuranceType as typeof clinicServiceRules.$inferInsert.insuranceType,
          accepts: (row.accepts as typeof clinicServiceRules.$inferInsert.accepts) ?? 'UNKNOWN',
          newPatientsOnly: (row.newPatientsOnly as boolean) ?? false,
          conditionsText: (row.conditionsText as string) ?? null,
        })),
      )
    }

    const updated = await db
      .select()
      .from(clinicServiceRules)
      .where(eq(clinicServiceRules.clinicId, clinicId))
    return { data: updated }
  })
}
