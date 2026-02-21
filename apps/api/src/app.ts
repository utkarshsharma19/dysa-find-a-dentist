import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import { healthRoute } from './routes/health.js'

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
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

  // Routes
  app.register(healthRoute)

  return app
}
