'use client'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

export function Disclaimer() {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <AlertTitle>Important Notice</AlertTitle>
      This tool helps you find dental care options in Maryland. It does not provide medical advice.{' '}
      <strong>If you are experiencing a medical emergency, call 911 immediately.</strong>{' '}
      Information shown may not be current — always confirm directly with the clinic.
    </Alert>
  )
}
