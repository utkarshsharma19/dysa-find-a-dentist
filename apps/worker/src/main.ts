import { createDb } from '@dysa/db'
import { startMatchWorker } from './worker.js'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const db = createDb(DATABASE_URL)
const worker = startMatchWorker(db)

async function shutdown() {
  console.info('Shutting down worker...')
  await worker.close()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
