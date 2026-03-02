import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import { sources } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminSourcesRoute(app: FastifyInstance) {
  app.addHook('onRequest', app.verifyAdmin)

  app.get('/admin/clinics/:clinicId/sources', async (request) => {
    const { clinicId } = request.params as { clinicId: string }
    const db = getDb()
    const data = await db.select().from(sources).where(eq(sources.clinicId, clinicId))
    return { data }
  })

  app.post('/admin/clinics/:clinicId/sources', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { clinicId } = request.params as { clinicId: string }
    const body = request.body as Record<string, unknown>
    const db = getDb()

    const [source] = await db
      .insert(sources)
      .values({
        clinicId,
        sourceType: body.sourceType as typeof sources.$inferInsert.sourceType,
        sourceUrl: (body.sourceUrl as string) ?? null,
        rawNotes: (body.rawNotes as string) ?? null,
        verifiedFields: (body.verifiedFields as string[]) ?? null,
        capturedBy: request.adminUser?.email ?? null,
      })
      .returning()

    return reply.status(201).send({ source })
  })

  app.delete('/admin/sources/:id', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const db = getDb()

    await db.delete(sources).where(eq(sources.id, id))
    return reply.status(204).send()
  })
}
