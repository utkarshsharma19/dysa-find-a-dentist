'use client'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'
import type { UrgencyLevelType } from '@dysa/shared'

const OPTIONS: { value: UrgencyLevelType; label: string; description: string }[] = [
  { value: 'TODAY', label: 'Today', description: 'I need care right now' },
  { value: 'WITHIN_3_DAYS', label: 'Within a few days', description: 'Can wait 2-3 days' },
  { value: 'WITHIN_2_WEEKS', label: 'Within 2 weeks', description: 'Not urgent but need it soon' },
  { value: 'JUST_EXPLORING', label: 'Just exploring', description: 'No rush, looking at options' },
]

export function UrgencyStep() {
  const { urgency } = useIntakeStore()

  function select(value: UrgencyLevelType) {
    updateIntake({ urgency: value })
    nextStep()
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        How soon do you need care?
      </Typography>
      <Grid container spacing={2}>
        {OPTIONS.map((o) => (
          <Grid size={{ xs: 12, sm: 6 }} key={o.value}>
            <Card
              variant={urgency === o.value ? 'elevation' : 'outlined'}
              sx={{
                borderColor: urgency === o.value ? 'primary.main' : undefined,
                borderWidth: urgency === o.value ? 2 : 1,
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
