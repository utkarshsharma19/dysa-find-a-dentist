import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { TRACE_HEADER } from '@dysa/shared'

async function requestContextPlugin(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    // Propagate trace header from upstream or use Fastify's generated ID
    const traceId = (request.headers[TRACE_HEADER] as string) ?? request.id
    reply.header(TRACE_HEADER, traceId)

    // Attach to request for downstream logging
    request.requestContext = { traceId }
  })
}

export default fp(requestContextPlugin, { name: 'request-context' })

// Extend Fastify types
declare module 'fastify' {
  interface FastifyRequest {
    requestContext: {
      traceId: string
    }
  }
}
