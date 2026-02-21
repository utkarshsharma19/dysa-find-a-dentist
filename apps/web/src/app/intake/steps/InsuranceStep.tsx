'use client'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'
import type { InsuranceTypeType } from '@dysa/shared'

const OPTIONS: { value: InsuranceTypeType; label: string; description: string }[] = [
  { value: 'MEDICAID', label: 'Medicaid', description: 'Maryland Medicaid (HealthChoice)' },
  { value: 'MEDICARE', label: 'Medicare', description: 'Medicare only' },
  {
    value: 'DUAL_MEDICAID_MEDICARE',
    label: 'Both Medicaid & Medicare',
    description: 'Dual eligible',
  },
  {
    value: 'PRIVATE',
    label: 'Private insurance',
    description: 'Employer or individual dental plan',
  },
  {
    value: 'UNINSURED_SELF_PAY',
    label: 'No insurance',
    description: 'Paying out of pocket',
  },
  { value: 'NOT_SURE', label: "I'm not sure", description: 'Not sure about my coverage' },
]

export function InsuranceStep() {
  const { insuranceType } = useIntakeStore()

  function select(value: InsuranceTypeType) {
    updateIntake({ insuranceType: value })
    nextStep()
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        What is your dental insurance?
      </Typography>
      <Grid container spacing={2}>
        {OPTIONS.map((o) => (
          <Grid size={{ xs: 12, sm: 6 }} key={o.value}>
            <Card
              variant={insuranceType === o.value ? 'elevation' : 'outlined'}
              sx={{
                borderColor: insuranceType === o.value ? 'primary.main' : undefined,
                borderWidth: insuranceType === o.value ? 2 : 1,
              }}
            >
              <CardActionArea onClick={() => select(o.value)} sx={{ p: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {o.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {o.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  )
}
