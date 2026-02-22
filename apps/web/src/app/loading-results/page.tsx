'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { getMatchJobStatus } from '@/lib/api'

const POLL_INTERVAL_MS = 2_000
const MAX_POLL_ATTEMPTS = 60

function LoadingResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = searchParams.get('jobId')
  const sessionId = searchParams.get('sessionId')

  const [status, setStatus] = useState<string>('queued')
  const [error, setError] = useState<string>('')
  const attemptRef = useRef(0)

  useEffect(() => {
    if (!jobId || !sessionId) return

    let cancelled = false

    async function poll() {
      while (!cancelled && attemptRef.current < MAX_POLL_ATTEMPTS) {
        attemptRef.current++

        try {
          const job = await getMatchJobStatus(jobId!)

          if (cancelled) return

          setStatus(job.status)

          if (job.status === 'completed') {
            router.push(`/results?sessionId=${sessionId}`)
            return
          }

          if (job.status === 'failed') {
            setError(job.errorMessage ?? 'The matching process failed. Please try again.')
            return
          }
        } catch {
          if (cancelled) return
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
      }

      if (!cancelled) {
        setError('Matching is taking longer than expected. Please try again later.')
      }
    }

    poll()

    return () => {
      cancelled = true
    }
  }, [jobId, sessionId, router])

  if (!jobId || !sessionId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error">Missing job or session information. Please start over.</Alert>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" href="/intake">
            Start Over
          </Button>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" href="/intake">
          Start Over
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <CircularProgress size={48} sx={{ mb: 3 }} />
      <Typography variant="h2">Finding your best options...</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          We are matching you with clinics based on your needs. This usually takes a few seconds.
        </Typography>
      </Box>
      {status === 'processing' && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Analyzing clinic options...
        </Typography>
      )}
    </Container>
  )
}

export default function LoadingResultsPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 3 }} />
          <Typography variant="h2">Finding your best options...</Typography>
        </Container>
      }
    >
      <LoadingResultsContent />
    </Suspense>
  )
}
