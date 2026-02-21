'use client'

import { useState } from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'

export function LocationStep() {
  const { zip } = useIntakeStore()
  const [value, setValue] = useState(zip ?? '')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!/^\d{5}$/.test(value)) {
      setError('Please enter a valid 5-digit ZIP code')
      return
    }
    setError('')
    updateIntake({ zip: value })
    nextStep()
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Where are you located?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Enter your ZIP code so we can find clinics near you.
      </Typography>
      <TextField
        label="ZIP Code"
        value={value}
        onChange={(e) => {
          const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 5)
          setValue(v)
        }}
        error={!!error}
        helperText={error}
        slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 5 } }}
        fullWidth
        sx={{ mb: 3 }}
      />
      <Box>
        <Button variant="contained" onClick={handleSubmit} disabled={value.length < 5}>
          Continue
        </Button>
      </Box>
    </>
  )
}
