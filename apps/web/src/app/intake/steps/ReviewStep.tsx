'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { useIntakeStore, resetIntake } from '@/lib/intake-store'
import { createSession } from '@/lib/api'

export function ReviewStep() {
  const state = useIntakeStore()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    try {
      const response = await createSession({
        zip: state.zip,
        lat: state.lat,
        lng: state.lng,
        chiefComplaint: state.chiefComplaint,
        insuranceType: state.insuranceType,
        medicaidPlan: state.medicaidPlan,
        urgency: state.urgency,
        budgetBand: state.budgetBand,
        travelMode: state.travelMode,
        travelTime: state.travelTime,
        languagePreference: state.languagePreference ?? 'ENGLISH',
        hasFever: state.hasFever,
        hasFacialSwelling: state.hasFacialSwelling,
        difficultySwallowingBreathing: state.difficultySwallowingBreathing,
        referralSource: state.referralSource,
      })

      resetIntake()

      if (response.triage.blocked) {
        // Emergency — redirect to emergency page with triage info
        const params = new URLSearchParams({
          title: response.triage.messageTitle ?? '',
          body: response.triage.messageBody ?? '',
        })
        router.push(`/emergency?${params.toString()}`)
      } else if (response.matchJobId) {
        // Normal flow — redirect to loading/polling page
        router.push(`/loading-results?jobId=${response.matchJobId}&sessionId=${response.sessionId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Ready to find your options
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        We will search for dental clinics that match your needs. This usually takes a few seconds.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ px: 6, py: 1.5 }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Find Dental Care'}
        </Button>
      </Box>
    </>
  )
}
