'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CallCoachCard from '@/components/CallCoachCard'
import { getRecommendations, type RecommendationItem } from '@/lib/api'
import {
  CALL_SCRIPTS,
  QUESTIONS_TO_ASK,
  COMPLAINT_LABELS,
  getChecklistForInsurance,
} from '@/lib/call-coach-data'
import { getIntakeState, initIntakeStore } from '@/lib/intake-store'

function CallCoachContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const clinicId = searchParams.get('clinicId')
  const rank = searchParams.get('rank')

  const [clinic, setClinic] = useState<RecommendationItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [insuranceType, setInsuranceType] = useState('NOT_SURE')
  const [complaintLabel, setComplaintLabel] = useState('a dental concern')

  useEffect(() => {
    initIntakeStore()
    const intake = getIntakeState()
    if (intake.insuranceType) setInsuranceType(intake.insuranceType)
    if (intake.chiefComplaint) {
      setComplaintLabel(COMPLAINT_LABELS[intake.chiefComplaint] ?? 'a dental concern')
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return

    async function fetchClinic() {
      try {
        const data = await getRecommendations(sessionId!)
        const match = data.recommendations.find(
          (r) => r.clinicId === clinicId || String(r.rank) === rank,
        )
        if (match) setClinic(match)
      } catch {
        setError('Failed to load clinic details.')
      } finally {
        setLoading(false)
      }
    }

    fetchClinic()
  }, [sessionId, clinicId, rank])

  if (!sessionId) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">Missing session information. Please go back to results.</Alert>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" href="/intake">
            Start Over
          </Button>
        </Box>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ mb: 3 }} />
        <Typography variant="h5">Loading call coach...</Typography>
      </Container>
    )
  }

  const script = CALL_SCRIPTS[insuranceType] ?? CALL_SCRIPTS['NOT_SURE']
  const checklist = getChecklistForInsurance(insuranceType)

  const personalizedIntro = script.intro
  const personalizedFollowUp = script.followUp.replace('[YOUR CONCERN]', complaintLabel)
  const fullScript = `${personalizedIntro}\n\n${personalizedFollowUp}`

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} href={`/results?sessionId=${sessionId}`} sx={{ mb: 2 }}>
        Back to results
      </Button>

      <Typography variant="h4" sx={{ mb: 1 }}>
        Prepare for Your Call
      </Typography>
      {clinic && (
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          {clinic.clinicName}
        </Typography>
      )}
      {clinic?.clinicPhone && (
        <Button variant="contained" href={`tel:${clinic.clinicPhone}`} sx={{ mb: 3 }}>
          Call {clinic.clinicPhone}
        </Button>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} Showing general guidance instead.
        </Alert>
      )}

      <CallCoachCard title="What to Say When You Call" copyText={fullScript}>
        <Typography
          variant="body1"
          sx={{
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 1,
            fontStyle: 'italic',
            mb: 2,
          }}
        >
          &ldquo;{personalizedIntro}&rdquo;
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          If they say yes, follow up with:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 1,
            fontStyle: 'italic',
          }}
        >
          &ldquo;{personalizedFollowUp}&rdquo;
        </Typography>
      </CallCoachCard>

      <CallCoachCard title="What to Bring / Have Ready">
        <List dense>
          {checklist.map((item) => (
            <ListItem key={item} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckBoxOutlineBlankIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </CallCoachCard>

      <CallCoachCard title="Key Questions to Ask">
        <List dense>
          {QUESTIONS_TO_ASK.map((question) => (
            <ListItem key={question} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <HelpOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={question} />
            </ListItem>
          ))}
        </List>
      </CallCoachCard>

      <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          href={`/results?sessionId=${sessionId}`}
        >
          Back to results
        </Button>
      </Box>
    </Container>
  )
}

export default function CallCoachPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 3 }} />
          <Typography variant="h5">Loading call coach...</Typography>
        </Container>
      }
    >
      <CallCoachContent />
    </Suspense>
  )
}
