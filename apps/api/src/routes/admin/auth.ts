import type { FastifyInstance } from 'fastify'
import { eq, and } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { adminUsers } from '@dysa/db'
import { getDb } from '../../db.js'
import { signAdminToken } from '../../plugins/admin-auth.js'

export async function adminAuthRoute(app: FastifyInstance) {
  // Login — no auth required
  app.post('/admin/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email?: string; password?: string }

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' })
    }

    const db = getDb()
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(and(eq(adminUsers.email, email), eq(adminUsers.active, true)))
      .limit(1)

    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    const token = signAdminToken({ sub: user.id, email: user.email, role: user.role })

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    })
  })

  // Get current user — requires auth
  app.get('/admin/auth/me', { onRequest: [app.verifyAdmin] }, async (request, reply) => {
    const db = getDb()
    const [user] = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        displayName: adminUsers.displayName,
        role: adminUsers.role,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, request.adminUser!.id))
      .limit(1)

    if (!user) {
      return reply.status(404).send({ error: 'User not found' })
    }

    return reply.send({ user })
  })
}
