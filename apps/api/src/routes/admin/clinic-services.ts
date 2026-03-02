import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { clinicServices } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminClinicServicesRoute(app: FastifyInstance) {
  app.addHook('onRequest', app.verifyAdmin)

  app.get('/admin/clinics/:clinicId/services', async (request) => {
    const { clinicId } = request.params as { clinicId: string }
    const db = getDb()
    const data = await db.select().from(clinicServices).where(eq(clinicServices.clinicId, clinicId))
    return { data }
  })

  app.put('/admin/clinics/:clinicId/services', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { clinicId } = request.params as { clinicId: string }
    const { data } = request.body as { data: Array<Record<string, unknown>> }
    const db = getDb()

    await db.delete(clinicServices).where(eq(clinicServices.clinicId, clinicId))

    if (data && data.length > 0) {
      await db.insert(clinicServices).values(
        data.map((row) => ({
          clinicId,
          serviceType: row.serviceType as typeof clinicServices.$inferInsert.serviceType,
          availableForMedicaid: (row.availableForMedicaid as boolean) ?? false,
          availableForUninsured: (row.availableForUninsured as boolean) ?? false,
          availableForPrivate: (row.availableForPrivate as boolean) ?? true,
          newPatientsAccepted: (row.newPatientsAccepted as boolean) ?? true,
          notes: (row.notes as string) ?? null,
        })),
      )
    }

    const updated = await db
      .select()
      .from(clinicServices)
      .where(eq(clinicServices.clinicId, clinicId))
    return { data: updated }
  })
}
