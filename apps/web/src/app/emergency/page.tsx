'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import PhoneIcon from '@mui/icons-material/Phone'

function EmergencyContent() {
  const searchParams = useSearchParams()
  const title = searchParams.get('title') || 'Seek Emergency Care Now'
  const body =
    searchParams.get('body') ||
    'Based on your symptoms, you may need immediate medical attention. This tool cannot help with medical emergencies.'

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>{title}</AlertTitle>
        {body}
      </Alert>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h2" gutterBottom>
          What to do now
        </Typography>

        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<PhoneIcon />}
          href="tel:911"
          sx={{ mt: 2, px: 6, py: 1.5 }}
        >
          Call 911
        </Button>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          Or go to your nearest hospital emergency room. If someone can drive you, that may be
          faster than waiting for an ambulance.
        </Typography>
      </Box>
    </Container>
  )
}

export default function EmergencyPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      }
    >
      <EmergencyContent />
    </Suspense>
  )
}
