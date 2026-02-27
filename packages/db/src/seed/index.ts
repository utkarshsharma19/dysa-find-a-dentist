import { sql } from 'drizzle-orm'
import { createDb } from '../connection.js'
import {
  clinics,
  clinicHours,
  clinicServices,
  accessRules,
  clinicServiceRules,
  pricing,
  accessTiming,
} from '../schema/index.js'
import { clinicsData } from './data/clinics.js'
import { clinicHoursData } from './data/clinic-hours.js'
import { clinicServicesData } from './data/clinic-services.js'
import { accessRulesData } from './data/access-rules.js'
import { clinicServiceRulesData } from './data/clinic-service-rules.js'
import { pricingData } from './data/pricing.js'
import { accessTimingData } from './data/access-timing.js'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const db = createDb(DATABASE_URL)

async function seed() {
  console.info('Seeding database...')

  // Clear existing data in reverse FK order
  console.info('  Clearing existing seed data...')
  await db.delete(accessTiming)
  await db.delete(pricing)
  await db.delete(clinicServiceRules)
  await db.delete(accessRules)
  await db.delete(clinicServices)
  await db.delete(clinicHours)
  // Delete clinics that match our fixed UUIDs (avoid wiping real data)
  const seedIds = clinicsData.map((c) => c.id)
  await db.delete(clinics).where(sql`id = ANY(${seedIds})`)

  // Insert in FK order
  console.info('  Inserting clinics...')
  await db.insert(clinics).values(clinicsData)

  console.info('  Inserting clinic hours...')
  await db.insert(clinicHours).values(clinicHoursData)

  console.info('  Inserting clinic services...')
  await db.insert(clinicServices).values(clinicServicesData)

  console.info('  Inserting access rules...')
  await db.insert(accessRules).values(accessRulesData)

  console.info('  Inserting clinic service rules...')
  await db.insert(clinicServiceRules).values(clinicServiceRulesData)

  console.info('  Inserting pricing...')
  await db.insert(pricing).values(pricingData)

  console.info('  Inserting access timing...')
  await db.insert(accessTiming).values(accessTimingData)

  console.info('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
