'use client'

import Typography from '@mui/material/Typography'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'

export function RedFlagsStep() {
  const { hasFever, hasFacialSwelling, difficultySwallowingBreathing } = useIntakeStore()

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Quick health check
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        These questions help us determine if you need emergency care right away.
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={hasFever ?? false}
              onChange={(e) => updateIntake({ hasFever: e.target.checked })}
            />
          }
          label="I have a fever"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={hasFacialSwelling ?? false}
              onChange={(e) => updateIntake({ hasFacialSwelling: e.target.checked })}
            />
          }
          label="I have swelling in my face or jaw"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={difficultySwallowingBreathing ?? false}
              onChange={(e) => updateIntake({ difficultySwallowingBreathing: e.target.checked })}
            />
          }
          label="I have difficulty breathing or swallowing"
        />
      </FormGroup>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={nextStep}>
          Continue
        </Button>
      </Box>
    </>
  )
}
