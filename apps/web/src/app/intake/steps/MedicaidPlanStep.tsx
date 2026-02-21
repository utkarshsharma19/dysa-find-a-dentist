'use client'

import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'
import type { MedicaidPlanType } from '@dysa/shared'

const PLANS: { value: MedicaidPlanType; label: string }[] = [
  { value: 'PRIORITY_PARTNERS', label: 'Priority Partners' },
  { value: 'AMERIGROUP', label: 'Amerigroup' },
  { value: 'MARYLAND_PHYSICIANS_CARE', label: 'Maryland Physicians Care' },
  { value: 'JAI_MEDICAL', label: 'Jai Medical Systems' },
  { value: 'MEDSTAR_FAMILY_CHOICE', label: 'MedStar Family Choice' },
  { value: 'UNITED_HEALTHCARE', label: 'UnitedHealthcare Community Plan' },
  { value: 'WELLPOINT', label: 'WellPoint (formerly CareFirst)' },
  { value: 'OTHER', label: 'Other MCO' },
  { value: 'UNSURE', label: "I don't know my plan" },
]

export function MedicaidPlanStep() {
  const { medicaidPlan } = useIntakeStore()

  function select(value: MedicaidPlanType) {
    updateIntake({ medicaidPlan: value })
    nextStep()
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Which Medicaid plan are you on?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Your plan name is on your insurance card. Clinics accept specific plans, not just
        &quot;Medicaid&quot; in general.
      </Typography>
      <List>
        {PLANS.map((p) => (
          <ListItemButton
            key={p.value}
            selected={medicaidPlan === p.value}
            onClick={() => select(p.value)}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemText primary={p.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  )
}
