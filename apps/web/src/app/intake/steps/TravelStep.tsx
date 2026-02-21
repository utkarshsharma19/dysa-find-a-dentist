'use client'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'
import type { TravelModeType, TravelTimeType } from '@dysa/shared'

const MODES: { value: TravelModeType; label: string }[] = [
  { value: 'DRIVES', label: 'I have a car' },
  { value: 'PUBLIC_TRANSIT', label: 'Bus or metro' },
  { value: 'WALK_ONLY', label: 'Walking only' },
  { value: 'RIDE_FROM_SOMEONE', label: 'Getting a ride' },
  { value: 'NOT_SURE', label: 'Not sure' },
]

const TIMES: { value: TravelTimeType; label: string }[] = [
  { value: 'UP_TO_15_MIN', label: '15 minutes' },
  { value: 'UP_TO_30_MIN', label: '30 minutes' },
  { value: 'UP_TO_60_MIN', label: '1 hour' },
  { value: 'ANY_DISTANCE', label: 'Any distance' },
]

export function TravelStep() {
  const { travelMode, travelTime } = useIntakeStore()

  return (
    <>
      <Typography variant="h2" gutterBottom>
        How will you get there?
      </Typography>
      <Grid container spacing={1} sx={{ mb: 4 }}>
        {MODES.map((m) => (
          <Grid size={{ xs: 6, sm: 4 }} key={m.value}>
            <Card
              variant={travelMode === m.value ? 'elevation' : 'outlined'}
              sx={{
                borderColor: travelMode === m.value ? 'primary.main' : undefined,
                borderWidth: travelMode === m.value ? 2 : 1,
              }}
            >
              <CardActionArea
                onClick={() => updateIntake({ travelMode: m.value })}
                sx={{ p: 1, textAlign: 'center' }}
              >
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {m.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h3" gutterBottom>
        How far are you willing to travel?
      </Typography>
      <Grid container spacing={1}>
        {TIMES.map((t) => (
          <Grid size={{ xs: 6, sm: 3 }} key={t.value}>
            <Card
              variant={travelTime === t.value ? 'elevation' : 'outlined'}
              sx={{
                borderColor: travelTime === t.value ? 'primary.main' : undefined,
                borderWidth: travelTime === t.value ? 2 : 1,
              }}
            >
              <CardActionArea
                onClick={() => updateIntake({ travelTime: t.value })}
                sx={{ p: 1, textAlign: 'center' }}
              >
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {t.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={nextStep} disabled={!travelMode || !travelTime}>
          Continue
        </Button>
      </Box>
    </>
  )
}
