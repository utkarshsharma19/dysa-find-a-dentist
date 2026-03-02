import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import { healthRoute } from './routes/health.js'
import { sessionsRoute } from './routes/sessions.js'
import { matchJobsRoute } from './routes/match-jobs.js'
import { recommendationsRoute } from './routes/recommendations.js'
import requestContext from './plugins/request-context.js'
import adminAuth from './plugins/admin-auth.js'
import { adminAuthRoute } from './routes/admin/auth.js'
import { adminClinicsRoute } from './routes/admin/clinics.js'
import { adminClinicHoursRoute } from './routes/admin/clinic-hours.js'
import { adminClinicServicesRoute } from './routes/admin/clinic-services.js'
import { adminAccessRulesRoute } from './routes/admin/access-rules.js'
import { adminPricingRoute } from './routes/admin/pricing.js'
import { adminIntakeChannelsRoute } from './routes/admin/intake-channels.js'
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
  app.register(adminAuth)

  // Routes
  app.register(healthRoute)
  app.register(sessionsRoute)
  app.register(matchJobsRoute)
  app.register(recommendationsRoute)

  // Admin routes
  app.register(adminAuthRoute)
  app.register(adminClinicsRoute)
  app.register(adminClinicHoursRoute)
  app.register(adminClinicServicesRoute)
  app.register(adminAccessRulesRoute)
  app.register(adminPricingRoute)
  app.register(adminIntakeChannelsRoute)

  return app
}
