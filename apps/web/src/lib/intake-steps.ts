import type { IntakeState } from './intake-store'

export interface StepDef {
  id: string
  label: string
  shouldShow: (state: IntakeState) => boolean
}

export const INTAKE_STEPS: StepDef[] = [
  {
    id: 'complaint',
    label: "What's going on?",
    shouldShow: () => true,
  },
  {
    id: 'red-flags',
    label: 'Quick health check',
    shouldShow: (state) => {
      // Only show for complaints that might have red flags
      const redFlagComplaints = ['PAIN', 'SWELLING', 'BUMP_ON_GUM', 'TOOTH_KNOCKED_OUT']
      return !!state.chiefComplaint && redFlagComplaints.includes(state.chiefComplaint)
    },
  },
  {
    id: 'insurance',
    label: 'Insurance',
    shouldShow: () => true,
  },
  {
    id: 'medicaid-plan',
    label: 'Medicaid plan',
    shouldShow: (state) => {
      return state.insuranceType === 'MEDICAID' || state.insuranceType === 'DUAL_MEDICAID_MEDICARE'
    },
  },
  {
    id: 'urgency',
    label: 'How soon?',
    shouldShow: () => true,
  },
  {
    id: 'budget',
    label: 'Budget',
    shouldShow: (state) => {
      // Skip for Medicaid patients — their services are covered
      return state.insuranceType !== 'MEDICAID' && state.insuranceType !== 'DUAL_MEDICAID_MEDICARE'
    },
  },
  {
    id: 'location',
    label: 'Location',
    shouldShow: () => true,
  },
  {
    id: 'travel',
    label: 'Travel',
    shouldShow: () => true,
  },
  {
    id: 'language',
    label: 'Language',
    shouldShow: () => true,
  },
]

export function getVisibleSteps(state: IntakeState): StepDef[] {
  return INTAKE_STEPS.filter((step) => step.shouldShow(state))
}
