import { describe, it, expect } from 'vitest'
import { evaluateTriage } from '../services/triage.js'
import type { CreateSessionInput } from '@dysa/shared'

function makeInput(overrides: Partial<CreateSessionInput> = {}): CreateSessionInput {
  return {
    chiefComplaint: 'PAIN',
    insuranceType: 'UNINSURED_SELF_PAY',
    urgency: 'WITHIN_3_DAYS',
    languagePreference: 'ENGLISH',
    ...overrides,
  }
}

describe('evaluateTriage', () => {
  it('allows normal flow for routine complaints', () => {
    const result = evaluateTriage(makeInput({ chiefComplaint: 'CLEANING_CHECKUP' }))
    expect(result.action).toBe('ALLOW_NORMAL')
    expect(result.blocked).toBe(false)
  })

  it('routes to ED when difficulty breathing/swallowing', () => {
    const result = evaluateTriage(
      makeInput({
        chiefComplaint: 'PAIN',
        difficultySwallowingBreathing: true,
      }),
    )
    expect(result.action).toBe('ROUTE_TO_ED')
    expect(result.blocked).toBe(true)
    expect(result.messageTitle).toContain('911')
  })

  it('routes to ED for swelling + fever', () => {
    const result = evaluateTriage(
      makeInput({
        chiefComplaint: 'SWELLING',
        hasFever: true,
      }),
    )
    expect(result.action).toBe('ROUTE_TO_ED')
    expect(result.blocked).toBe(true)
  })

  it('routes to ED for swelling + facial swelling', () => {
    const result = evaluateTriage(
      makeInput({
        chiefComplaint: 'SWELLING',
        hasFacialSwelling: true,
      }),
    )
    expect(result.action).toBe('ROUTE_TO_ED')
    expect(result.blocked).toBe(true)
  })

  it('shows warning for pain + fever', () => {
    const result = evaluateTriage(
      makeInput({
        chiefComplaint: 'PAIN',
        hasFever: true,
      }),
    )
    expect(result.action).toBe('SHOW_WARNING')
    expect(result.blocked).toBe(false)
  })

  it('shows warning for bump on gum + fever', () => {
    const result = evaluateTriage(
      makeInput({
        chiefComplaint: 'BUMP_ON_GUM',
        hasFever: true,
      }),
    )
    expect(result.action).toBe('SHOW_WARNING')
    expect(result.blocked).toBe(false)
  })

  it('boosts urgency for knocked-out tooth', () => {
    const result = evaluateTriage(
      makeInput({
        chiefComplaint: 'TOOTH_KNOCKED_OUT',
      }),
    )
    expect(result.action).toBe('BOOST_URGENCY')
    expect(result.blocked).toBe(false)
    expect(result.messageTitle).toContain('Time-Sensitive')
  })

  it('allows normal for pain without red flags', () => {
    const result = evaluateTriage(
      makeInput({
        chiefComplaint: 'PAIN',
        hasFever: false,
        hasFacialSwelling: false,
      }),
    )
    expect(result.action).toBe('ALLOW_NORMAL')
    expect(result.blocked).toBe(false)
  })

  it('breathing difficulty overrides all other rules', () => {
    const result = evaluateTriage(
      makeInput({
        chiefComplaint: 'CLEANING_CHECKUP',
        difficultySwallowingBreathing: true,
      }),
    )
    expect(result.action).toBe('ROUTE_TO_ED')
    expect(result.blocked).toBe(true)
  })
})
