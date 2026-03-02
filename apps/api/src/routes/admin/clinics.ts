import type { FastifyInstance } from 'fastify'
import { eq, and, ilike, or, count } from 'drizzle-orm'
import { clinics } from '@dysa/db'
import { getDb } from '../../db.js'

export async function adminClinicsRoute(app: FastifyInstance) {
  // All clinic admin routes require auth
  app.addHook('onRequest', app.verifyAdmin)

  // List clinics with search, filter, pagination
  app.get('/admin/clinics', async (request) => {
    const {
      page = 1,
      pageSize = 25,
      search,
      active,
    } = request.query as {
      page?: number
      pageSize?: number
      search?: string
      active?: string
    }

    const db = getDb()
    const offset = (Number(page) - 1) * Number(pageSize)
    const limit = Math.min(Number(pageSize), 100)

    const conditions = []
    if (active !== undefined) {
      conditions.push(eq(clinics.active, active === 'true'))
    }
    if (search) {
      conditions.push(
        or(
          ilike(clinics.name, `%${search}%`),
          ilike(clinics.city, `%${search}%`),
          ilike(clinics.county, `%${search}%`),
          ilike(clinics.zip, `%${search}%`),
        ),
      )
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [data, [{ total }]] = await Promise.all([
      db
        .select({
          id: clinics.id,
          name: clinics.name,
          clinicType: clinics.clinicType,
          city: clinics.city,
          county: clinics.county,
          active: clinics.active,
          lastVerifiedAt: clinics.lastVerifiedAt,
        })
        .from(clinics)
        .where(where)
        .orderBy(clinics.name)
        .offset(offset)
        .limit(limit),
      db.select({ total: count() }).from(clinics).where(where),
    ])

    return { data, total, page: Number(page), pageSize: limit }
  })

  // Get single clinic
  app.get('/admin/clinics/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const db = getDb()

    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1)

    if (!clinic) {
      return reply.status(404).send({ error: 'Clinic not found' })
    }

    return { clinic }
  })

  // Create clinic
  app.post('/admin/clinics', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const body = request.body as Record<string, unknown>
    const db = getDb()

    const [clinic] = await db
      .insert(clinics)
      .values({
        name: body.name as string,
        clinicType: body.clinicType as typeof clinics.$inferInsert.clinicType,
        address: (body.address as string) ?? null,
        city: (body.city as string) ?? null,
        state: (body.state as string) ?? 'MD',
        zip: (body.zip as string) ?? null,
        county: (body.county as string) ?? null,
        lat: body.lat != null ? Number(body.lat) : null,
        lng: body.lng != null ? Number(body.lng) : null,
        phone: (body.phone as string) ?? null,
        phoneSecondary: (body.phoneSecondary as string) ?? null,
        websiteUrl: (body.websiteUrl as string) ?? null,
        intakeUrl: (body.intakeUrl as string) ?? null,
        active: body.active !== false,
        languagesAvailable: (body.languagesAvailable as string[]) ?? null,
        adaAccessible:
          (body.adaAccessible as typeof clinics.$inferInsert.adaAccessible) ?? 'UNKNOWN',
        parkingAvailable:
          (body.parkingAvailable as typeof clinics.$inferInsert.parkingAvailable) ?? 'UNKNOWN',
        nearTransitStop: (body.nearTransitStop as boolean) ?? false,
        notesInternal: (body.notesInternal as string) ?? null,
      })
      .returning()

    return reply.status(201).send({ clinic })
  })

  // Update clinic
  app.put('/admin/clinics/:id', async (request, reply) => {
    const writeGuard = app.requireRole('ADMIN', 'EDITOR')
    await writeGuard(request, reply)
    if (reply.sent) return

    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>
    const db = getDb()

    // Build update object from provided fields
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    const allowedFields = [
      'name',
      'clinicType',
      'address',
      'city',
      'state',
      'zip',
      'county',
      'lat',
      'lng',
      'phone',
      'phoneSecondary',
      'websiteUrl',
      'intakeUrl',
      'active',
      'languagesAvailable',
      'adaAccessible',
      'parkingAvailable',
      'nearTransitStop',
      'lastVerifiedAt',
      'verificationConfidence',
      'notesInternal',
    ]

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    const [clinic] = await db.update(clinics).set(updates).where(eq(clinics.id, id)).returning()

    if (!clinic) {
      return reply.status(404).send({ error: 'Clinic not found' })
    }

    return { clinic }
  })
}
