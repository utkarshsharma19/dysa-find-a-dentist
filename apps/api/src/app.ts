import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import { healthRoute } from './routes/health.js'
import { sessionsRoute } from './routes/sessions.js'
import requestContext from './plugins/request-context.js'
import { LOG_FIELDS_BLOCKLIST } from '@dysa/shared'

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      redact: [...LOG_FIELDS_BLOCKLIST],
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    genReqId: () => crypto.randomUUID(),
  })

  // Plugins
  app.register(cors, { origin: process.env.CORS_ORIGIN ?? true })
  app.register(helmet)
  app.register(sensible)
  app.register(requestContext)

  // Routes
  app.register(healthRoute)
  app.register(sessionsRoute)

  return app
}
