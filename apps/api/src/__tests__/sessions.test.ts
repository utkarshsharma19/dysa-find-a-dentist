import { describe, it, expect } from 'vitest'
import { CreateSessionSchema } from '@dysa/shared'

describe('CreateSessionSchema validation', () => {
  const validInput = {
    zip: '21201',
    chiefComplaint: 'PAIN',
    insuranceType: 'MEDICAID',
    medicaidPlan: 'PRIORITY_PARTNERS',
    urgency: 'TODAY',
    languagePreference: 'ENGLISH',
  }

  it('accepts valid input', () => {
    const result = CreateSessionSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('rejects invalid ZIP code', () => {
    const result = CreateSessionSchema.safeParse({ ...validInput, zip: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid enum values', () => {
    const result = CreateSessionSchema.safeParse({
      ...validInput,
      chiefComplaint: 'HEADACHE',
    })
    expect(result.success).toBe(false)
  })

  it('requires medicaidPlan when insuranceType is MEDICAID', () => {
    const result = CreateSessionSchema.safeParse({
      ...validInput,
      insuranceType: 'MEDICAID',
      medicaidPlan: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('does not require medicaidPlan when insuranceType is PRIVATE', () => {
    const result = CreateSessionSchema.safeParse({
      ...validInput,
      insuranceType: 'PRIVATE',
      medicaidPlan: undefined,
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional fields as undefined', () => {
    const minimal = {
      chiefComplaint: 'PAIN',
      insuranceType: 'UNINSURED_SELF_PAY',
      urgency: 'WITHIN_3_DAYS',
    }
    const result = CreateSessionSchema.safeParse(minimal)
    expect(result.success).toBe(true)
  })

  it('validates lat/lng bounds', () => {
    const result = CreateSessionSchema.safeParse({ ...validInput, lat: 200, lng: 0 })
    expect(result.success).toBe(false)
  })

  it('accepts valid lat/lng', () => {
    const result = CreateSessionSchema.safeParse({
      ...validInput,
      lat: 39.29,
      lng: -76.61,
    })
    expect(result.success).toBe(true)
  })
})
