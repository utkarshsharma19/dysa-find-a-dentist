import type { FastifyInstance } from 'fastify'
import { APP_NAME, APP_VERSION } from '@dysa/shared'

export async function healthRoute(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    name: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
  }))
}
