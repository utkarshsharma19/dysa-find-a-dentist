'use client'

import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'
import type { BudgetBandType } from '@dysa/shared'

const OPTIONS: { value: BudgetBandType; label: string; description: string }[] = [
  { value: 'FREE_ONLY', label: 'Free care only', description: 'I can only access free services' },
  { value: 'UNDER_50', label: 'Up to $50', description: 'I can pay a small amount' },
  { value: '50_TO_150', label: '$50 - $150', description: 'I have a moderate budget' },
  { value: '150_PLUS', label: '$150+', description: 'I can pay more if needed' },
  { value: 'NOT_SURE', label: "I'm not sure", description: 'Not sure what I can afford' },
]

export function BudgetStep() {
  const { budgetBand } = useIntakeStore()

  function select(value: BudgetBandType) {
    updateIntake({ budgetBand: value })
    nextStep()
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        What can you afford to pay?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        This helps us find clinics within your budget. Many clinics offer sliding-scale fees.
      </Typography>
      <List>
        {OPTIONS.map((o) => (
          <ListItemButton
            key={o.value}
            selected={budgetBand === o.value}
            onClick={() => select(o.value)}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemText primary={o.label} secondary={o.description} />
          </ListItemButton>
        ))}
      </List>
    </>
  )
}
