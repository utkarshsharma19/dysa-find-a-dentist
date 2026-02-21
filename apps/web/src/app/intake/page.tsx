'use client'

import { useEffect } from 'react'
import Container from '@mui/material/Container'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useIntakeStore, initIntakeStore, prevStep } from '@/lib/intake-store'
import { getVisibleSteps } from '@/lib/intake-steps'
import { Disclaimer } from '@/components/Disclaimer'
import { ComplaintStep } from './steps/ComplaintStep'
import { RedFlagsStep } from './steps/RedFlagsStep'
import { InsuranceStep } from './steps/InsuranceStep'
import { MedicaidPlanStep } from './steps/MedicaidPlanStep'
import { UrgencyStep } from './steps/UrgencyStep'
import { BudgetStep } from './steps/BudgetStep'
import { LocationStep } from './steps/LocationStep'
import { TravelStep } from './steps/TravelStep'
import { LanguageStep } from './steps/LanguageStep'

const STEP_COMPONENTS: Record<string, React.ComponentType> = {
  complaint: ComplaintStep,
  'red-flags': RedFlagsStep,
  insurance: InsuranceStep,
  'medicaid-plan': MedicaidPlanStep,
  urgency: UrgencyStep,
  budget: BudgetStep,
  location: LocationStep,
  travel: TravelStep,
  language: LanguageStep,
}

export default function IntakePage() {
  const state = useIntakeStore()

  useEffect(() => {
    initIntakeStore()
  }, [])

  const visibleSteps = getVisibleSteps(state)
  const currentStep = visibleSteps[state.step]
  const StepComponent = currentStep ? STEP_COMPONENTS[currentStep.id] : null

  // If we've gone past the last step, show the review/submit
  const isComplete = state.step >= visibleSteps.length

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Disclaimer />

      <Stepper
        activeStep={state.step}
        alternativeLabel
        sx={{ mb: 4, display: { xs: 'none', sm: 'flex' } }}
      >
        {visibleSteps.map((step) => (
          <Step key={step.id}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {isComplete ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <p>Ready to submit! (PR-FE-004 will wire this up)</p>
        </Box>
      ) : (
        StepComponent && <StepComponent />
      )}

      {state.step > 0 && !isComplete && (
        <Box sx={{ mt: 2 }}>
          <Button onClick={prevStep} color="inherit">
            Back
          </Button>
        </Box>
      )}
    </Container>
  )
}
