import { createDb, type Database } from '@dysa/db'

let _db: Database | null = null

export function getDb(): Database {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    _db = createDb(url)
  }
  return _db
}
