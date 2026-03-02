import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { intakeChannels } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminIntakeChannelsRoute(app: FastifyInstance) {
  app.addHook('onRequest', app.verifyAdmin)

  app.get('/admin/clinics/:clinicId/intake-channels', async (request) => {
    const { clinicId } = request.params as { clinicId: string }
    const db = getDb()
    const data = await db.select().from(intakeChannels).where(eq(intakeChannels.clinicId, clinicId))
    return { data }
  })

  app.put('/admin/clinics/:clinicId/intake-channels', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { clinicId } = request.params as { clinicId: string }
    const { data } = request.body as { data: Array<Record<string, unknown>> }
    const db = getDb()

    await db.delete(intakeChannels).where(eq(intakeChannels.clinicId, clinicId))

    if (data && data.length > 0) {
      await db.insert(intakeChannels).values(
        data.map((row) => ({
          clinicId,
          channel: row.channel as typeof intakeChannels.$inferInsert.channel,
          detailsText: (row.detailsText as string) ?? null,
          onlineLink: (row.onlineLink as string) ?? null,
        })),
      )
    }

    const updated = await db
      .select()
      .from(intakeChannels)
      .where(eq(intakeChannels.clinicId, clinicId))
    return { data: updated }
  })
}
