import { startMatchWorker } from '@dysa/worker'
import { buildApp } from './app.js'
import { getDb } from './db.js'

const PORT = Number(process.env.PORT ?? 3001)
const HOST = process.env.HOST ?? '0.0.0.0'
const RUN_WORKER_INLINE = process.env.RUN_WORKER_INLINE === 'true'

async function main() {
  const app = buildApp()

  try {
    await app.listen({ port: PORT, host: HOST })
    console.info(`API server listening on ${HOST}:${PORT}`)

    if (RUN_WORKER_INLINE) {
      const worker = startMatchWorker(getDb())
      const shutdown = async () => {
        console.info('Shutting down...')
        await worker.close()
        await app.close()
        process.exit(0)
      }
      process.on('SIGTERM', shutdown)
      process.on('SIGINT', shutdown)
    }
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
