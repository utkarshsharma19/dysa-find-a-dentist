import { sql } from 'drizzle-orm'

// PostGIS extension — must be enabled before any spatial columns/indexes
export const enablePostGIS = sql`CREATE EXTENSION IF NOT EXISTS postgis`
