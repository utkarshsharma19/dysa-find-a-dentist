import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

export interface AdminTokenPayload {
  sub: string
  email: string
  role: string
}

async function adminAuthPlugin(app: FastifyInstance) {
  app.decorate('verifyAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' })
    }

    const token = header.slice(7)
    try {
      const payload = jwt.verify(token, JWT_SECRET) as AdminTokenPayload
      request.adminUser = { id: payload.sub, email: payload.email, role: payload.role }
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired token' })
    }
  })

  app.decorate(
    'requireRole',
    (...roles: string[]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.adminUser) {
          return reply.status(401).send({ error: 'Not authenticated' })
        }
        if (!roles.includes(request.adminUser.role)) {
          return reply.status(403).send({ error: 'Insufficient permissions' })
        }
      },
  )
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export default fp(adminAuthPlugin, { name: 'admin-auth' })

declare module 'fastify' {
  interface FastifyInstance {
    verifyAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRole: (
      ...roles: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    adminUser?: {
      id: string
      email: string
      role: string
    }
  }
}
