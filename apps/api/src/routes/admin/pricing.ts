import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { pricing } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminPricingRoute(app: FastifyInstance) {
  app.addHook('onRequest', app.verifyAdmin)

  app.get('/admin/clinics/:clinicId/pricing', async (request) => {
    const { clinicId } = request.params as { clinicId: string }
    const db = getDb()
    const data = await db.select().from(pricing).where(eq(pricing.clinicId, clinicId))
    return { data }
  })

  app.put('/admin/clinics/:clinicId/pricing', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { clinicId } = request.params as { clinicId: string }
    const { data } = request.body as { data: Array<Record<string, unknown>> }
    const db = getDb()

    await db.delete(pricing).where(eq(pricing.clinicId, clinicId))

    if (data && data.length > 0) {
      await db.insert(pricing).values(
        data.map((row) => ({
          clinicId,
          serviceType: row.serviceType as typeof pricing.$inferInsert.serviceType,
          priceMin: (row.priceMin as string) ?? null,
          priceMax: (row.priceMax as string) ?? null,
          pricingModel: (row.pricingModel as typeof pricing.$inferInsert.pricingModel) ?? 'UNKNOWN',
          conditionsText: (row.conditionsText as string) ?? null,
          medicaidCopay: (row.medicaidCopay as string) ?? null,
          confidence: (row.confidence as typeof pricing.$inferInsert.confidence) ?? 'UNKNOWN',
        })),
      )
    }

    const updated = await db.select().from(pricing).where(eq(pricing.clinicId, clinicId))
    return { data: updated }
  })
}
