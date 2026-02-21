'use client'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'
import type { ChiefComplaintType } from '@dysa/shared'

const COMPLAINTS: { value: ChiefComplaintType; label: string; description: string }[] = [
  { value: 'PAIN', label: 'Tooth/mouth pain', description: 'Aching, throbbing, or sharp pain' },
  { value: 'SWELLING', label: 'Swelling', description: 'In mouth, face, or jaw' },
  {
    value: 'BROKEN_CHIPPED_TOOTH',
    label: 'Broken or chipped tooth',
    description: 'Tooth is cracked or has a piece missing',
  },
  {
    value: 'TOOTH_KNOCKED_OUT',
    label: 'Tooth knocked out',
    description: 'Tooth completely came out — this is urgent',
  },
  {
    value: 'NEED_TOOTH_PULLED',
    label: 'Need a tooth pulled',
    description: 'Told you need an extraction or believe you do',
  },
  {
    value: 'FILLING_CROWN_FELL_OUT',
    label: 'Filling/crown fell out',
    description: 'A filling or crown came loose or fell off',
  },
  {
    value: 'BUMP_ON_GUM',
    label: 'Bump on gum',
    description: 'Pimple-like bump or sore on the gum',
  },
  {
    value: 'CLEANING_CHECKUP',
    label: 'Cleaning or checkup',
    description: 'Routine dental visit',
  },
  { value: 'DENTURES', label: 'Dentures', description: 'Need new dentures or denture repair' },
  {
    value: 'NOT_SURE',
    label: "I'm not sure",
    description: "Something is wrong but I'm not sure what",
  },
]

export function ComplaintStep() {
  const { chiefComplaint } = useIntakeStore()

  function select(value: ChiefComplaintType) {
    updateIntake({ chiefComplaint: value })
    nextStep()
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        What is going on with your teeth?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select the option that best describes your situation.
      </Typography>
      <Grid container spacing={2}>
        {COMPLAINTS.map((c) => (
          <Grid size={{ xs: 12, sm: 6 }} key={c.value}>
            <Card
              variant={chiefComplaint === c.value ? 'elevation' : 'outlined'}
              sx={{
                borderColor: chiefComplaint === c.value ? 'primary.main' : undefined,
                borderWidth: chiefComplaint === c.value ? 2 : 1,
              }}
            >
              <CardActionArea onClick={() => select(c.value)} sx={{ p: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {c.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.description}
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
