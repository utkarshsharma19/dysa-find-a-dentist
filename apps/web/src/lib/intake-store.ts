'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type {
  ChiefComplaintType,
  InsuranceTypeType,
  MedicaidPlanType,
  UrgencyLevelType,
  BudgetBandType,
  TravelModeType,
  TravelTimeType,
  LanguagePreferenceType,
} from '@dysa/shared'

export interface IntakeState {
  step: number
  chiefComplaint?: ChiefComplaintType
  insuranceType?: InsuranceTypeType
  medicaidPlan?: MedicaidPlanType
  urgency?: UrgencyLevelType
  budgetBand?: BudgetBandType
  zip?: string
  lat?: number
  lng?: number
  travelMode?: TravelModeType
  travelTime?: TravelTimeType
  languagePreference?: LanguagePreferenceType
  hasFever?: boolean
  hasFacialSwelling?: boolean
  difficultySwallowingBreathing?: boolean
  referralSource?: string
}

const STORAGE_KEY = 'dysa-intake-draft'

let state: IntakeState = { step: 0 }
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage may not be available
  }
}

function restore(): IntakeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return { step: 0 }
}

export function initIntakeStore() {
  state = restore()
  notify()
}

export function updateIntake(updates: Partial<IntakeState>) {
  state = { ...state, ...updates }
  persist()
  notify()
}

export function nextStep() {
  updateIntake({ step: state.step + 1 })
}

export function prevStep() {
  if (state.step > 0) {
    updateIntake({ step: state.step - 1 })
  }
}

export function resetIntake() {
  state = { step: 0 }
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  notify()
}

export function getIntakeState(): IntakeState {
  return state
}

export function useIntakeStore(): IntakeState {
  return useSyncExternalStore(
    useCallback((cb: () => void) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    }, []),
    () => state,
    () => ({ step: 0 }),
  )
}
