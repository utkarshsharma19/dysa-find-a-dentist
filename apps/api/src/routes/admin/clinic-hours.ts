import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { clinicHours } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminClinicHoursRoute(app: FastifyInstance) {
  app.addHook('onRequest', app.verifyAdmin)

  app.get('/admin/clinics/:clinicId/hours', async (request) => {
    const { clinicId } = request.params as { clinicId: string }
    const db = getDb()
    const data = await db.select().from(clinicHours).where(eq(clinicHours.clinicId, clinicId))
    return { data }
  })

  app.put('/admin/clinics/:clinicId/hours', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { clinicId } = request.params as { clinicId: string }
    const { data } = request.body as { data: Array<Record<string, unknown>> }
    const db = getDb()

    // Replace all hours for this clinic
    await db.delete(clinicHours).where(eq(clinicHours.clinicId, clinicId))

    if (data && data.length > 0) {
      await db.insert(clinicHours).values(
        data.map((row) => ({
          clinicId,
          dayOfWeek: Number(row.dayOfWeek),
          openTime: (row.openTime as string) ?? null,
          closeTime: (row.closeTime as string) ?? null,
          isWalkInHours: (row.isWalkInHours as boolean) ?? false,
          walkInStart: (row.walkInStart as string) ?? null,
          walkInEnd: (row.walkInEnd as string) ?? null,
          notes: (row.notes as string) ?? null,
        })),
      )
    }

    const updated = await db.select().from(clinicHours).where(eq(clinicHours.clinicId, clinicId))
    return { data: updated }
  })
}
