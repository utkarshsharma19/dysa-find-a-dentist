import { eq } from 'drizzle-orm'
import {
  clinics,
  accessRules,
  clinicServices,
  clinicServiceRules,
  pricing,
  accessTiming,
  sessions,
} from '@dysa/db'
import type { Database } from '@dysa/db'
import type { CandidateClinic, MatchInput } from './types.js'

export async function fetchMatchInput(db: Database, sessionId: string): Promise<MatchInput> {
  const rows = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)
  if (rows.length === 0) throw new Error(`Session ${sessionId} not found`)

  const s = rows[0]
  return {
    sessionId: s.id,
    chiefComplaint: s.chiefComplaint as MatchInput['chiefComplaint'],
    insuranceType: s.insuranceType as MatchInput['insuranceType'],
    medicaidPlan: s.medicaidPlan as MatchInput['medicaidPlan'],
    urgency: s.urgency as MatchInput['urgency'],
    budgetBand: s.budgetBand as MatchInput['budgetBand'],
    travelMode: s.travelMode as MatchInput['travelMode'],
    travelTime: s.travelTime as MatchInput['travelTime'],
    lat: s.latRound,
    lng: s.lngRound,
    languagePreference: s.languagePreference,
  }
}

export async function fetchCandidateClinics(db: Database): Promise<CandidateClinic[]> {
  // Separate queries to avoid cartesian products
  const [allClinics, allAccess, allServices, allServiceRules, allPricing, allTiming] =
    await Promise.all([
      db.select().from(clinics),
      db.select().from(accessRules),
      db.select().from(clinicServices),
      db.select().from(clinicServiceRules),
      db.select().from(pricing),
      db.select().from(accessTiming),
    ])

  // Index by clinicId
  const accessByClinic = new Map(allAccess.map((a) => [a.clinicId, a]))
  const servicesByClinic = groupBy(allServices, (s) => s.clinicId)
  const serviceRulesByClinic = groupBy(allServiceRules, (r) => r.clinicId)
  const pricingByClinic = groupBy(allPricing, (p) => p.clinicId)
  const timingByClinic = groupBy(allTiming, (t) => t.clinicId)

  return allClinics.map((c) => {
    const ar = accessByClinic.get(c.id)
    return {
      id: c.id,
      name: c.name,
      clinicType: c.clinicType,
      address: c.address,
      city: c.city,
      state: c.state,
      zip: c.zip,
      county: c.county,
      lat: c.lat,
      lng: c.lng,
      phone: c.phone,
      websiteUrl: c.websiteUrl,
      active: c.active,
      languagesAvailable: c.languagesAvailable,
      adaAccessible: c.adaAccessible as CandidateClinic['adaAccessible'],
      parkingAvailable: c.parkingAvailable as CandidateClinic['parkingAvailable'],
      nearTransitStop: c.nearTransitStop,
      lastVerifiedAt: c.lastVerifiedAt,
      accessRules: ar
        ? ({
            acceptsMedicaidAdults: ar.acceptsMedicaidAdults,
            acceptsMedicaidChildren: ar.acceptsMedicaidChildren,
            medicaidPlansAccepted: ar.medicaidPlansAccepted,
            acceptsMedicare: ar.acceptsMedicare,
            uninsuredWelcome: ar.uninsuredWelcome,
            slidingScaleAvailable: ar.slidingScaleAvailable,
            seesEmergencyPain: ar.seesEmergencyPain,
            seesSwelling: ar.seesSwelling,
            walkInAllowed: ar.walkInAllowed,
            referralRequired: ar.referralRequired,
            lastVerifiedAt: ar.lastVerifiedAt,
          } as NonNullable<CandidateClinic['accessRules']>)
        : null,
      services: (servicesByClinic.get(c.id) ?? []).map((s) => ({
        serviceType: s.serviceType as CandidateClinic['services'][0]['serviceType'],
        availableForMedicaid: s.availableForMedicaid ?? false,
        availableForUninsured: s.availableForUninsured ?? false,
        availableForPrivate: s.availableForPrivate ?? true,
        newPatientsAccepted: s.newPatientsAccepted ?? true,
        lastVerifiedAt: s.lastVerifiedAt,
      })),
      serviceRules: (serviceRulesByClinic.get(c.id) ?? []).map((r) => ({
        serviceType: r.serviceType as CandidateClinic['serviceRules'][0]['serviceType'],
        insuranceType: r.insuranceType as CandidateClinic['serviceRules'][0]['insuranceType'],
        accepts: (r.accepts ?? 'UNKNOWN') as CandidateClinic['serviceRules'][0]['accepts'],
      })),
      pricingEntries: (pricingByClinic.get(c.id) ?? []).map((p) => ({
        serviceType: p.serviceType as CandidateClinic['pricingEntries'][0]['serviceType'],
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        pricingModel: p.pricingModel,
        medicaidCopay: p.medicaidCopay,
        lastVerifiedAt: p.lastVerifiedAt,
      })),
      accessTimingEntries: (timingByClinic.get(c.id) ?? []).map((t) => ({
        serviceType: t.serviceType as CandidateClinic['accessTimingEntries'][0]['serviceType'],
        insuranceType:
          t.insuranceType as CandidateClinic['accessTimingEntries'][0]['insuranceType'],
        nextAvailableDaysEstimate: t.nextAvailableDaysEstimate,
      })),
    } satisfies CandidateClinic
  })
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    const list = map.get(key)
    if (list) {
      list.push(item)
    } else {
      map.set(key, [item])
    }
  }
  return map
}
