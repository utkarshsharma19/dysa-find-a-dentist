'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import AccessibleIcon from '@mui/icons-material/Accessible'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PhoneIcon from '@mui/icons-material/Phone'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ConfidenceBadge from '@/components/ConfidenceBadge'
import { getRecommendations, type RecommendationItem } from '@/lib/api'

const BUCKET_CONFIG: Record<string, { heading: string; description: string }> = {
  BEST_MATCH: {
    heading: 'Best Matches',
    description: 'These clinics are the strongest fit for your needs.',
  },
  GOOD_MATCH: {
    heading: 'Good Options',
    description: 'These clinics also meet many of your criteria.',
  },
  OTHER_OPTIONS: {
    heading: 'Other Options',
    description: 'These clinics may work but have some limitations.',
  },
}

const BUCKET_ORDER = ['BEST_MATCH', 'GOOD_MATCH', 'OTHER_OPTIONS']

function ClinicCard({ rec, sessionId }: { rec: RecommendationItem; sessionId: string }) {
  const scorePercent = rec.scoreTotal ? Math.round(parseFloat(rec.scoreTotal) * 100) : null

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
        >
          <Box>
            <Typography variant="h6" component="h3">
              {rec.clinicName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {rec.clinicType.replace(/_/g, ' ')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {scorePercent !== null && (
              <Typography variant="body2" fontWeight="bold" color="primary">
                {scorePercent}% match
              </Typography>
            )}
            <ConfidenceBadge confidence={rec.displayConfidence} />
          </Stack>
        </Box>

        {(rec.clinicAddress || rec.clinicCity) && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {[rec.clinicAddress, rec.clinicCity, rec.clinicState, rec.clinicZip]
              .filter(Boolean)
              .join(', ')}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          {rec.clinicAdaAccessible === 'YES' && (
            <Chip
              icon={<AccessibleIcon />}
              label="ADA Accessible"
              size="small"
              variant="outlined"
            />
          )}
          {rec.clinicParkingAvailable === 'YES' && (
            <Chip icon={<LocalParkingIcon />} label="Parking" size="small" variant="outlined" />
          )}
          {rec.clinicNearTransitStop && (
            <Chip
              icon={<DirectionsBusIcon />}
              label="Near Transit"
              size="small"
              variant="outlined"
            />
          )}
          {rec.clinicLanguages && rec.clinicLanguages.length > 1 && (
            <Chip
              label={rec.clinicLanguages
                .map((l) => l.charAt(0) + l.slice(1).toLowerCase())
                .join(', ')}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={2} flexWrap="wrap">
          {rec.clinicPhone && (
            <Button
              variant="contained"
              size="small"
              startIcon={<PhoneIcon />}
              href={`tel:${rec.clinicPhone}`}
            >
              {rec.clinicPhone}
            </Button>
          )}
          {rec.clinicWebsiteUrl && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNewIcon />}
              href={rec.clinicWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            href={`/results/call-coach?sessionId=${sessionId}&clinicId=${rec.clinicId}&rank=${rec.rank}`}
          >
            Prepare for your call
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchResults = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)
    setError('')
    try {
      const data = await getRecommendations(sessionId)
      setRecommendations(data.recommendations)
    } catch {
      setError('Failed to load recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  if (!sessionId) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">Missing session information. Please start over.</Alert>
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
        <Typography variant="h5">Loading your results...</Typography>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" onClick={fetchResults}>
            Try Again
          </Button>
          <Button variant="outlined" href="/intake">
            Start Over
          </Button>
        </Stack>
      </Container>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          No Matches Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We could not find clinics matching your criteria. Try adjusting your preferences and
          searching again.
        </Typography>
        <Button variant="contained" href="/intake">
          Start Over
        </Button>
      </Container>
    )
  }

  const grouped = BUCKET_ORDER.reduce<Record<string, RecommendationItem[]>>((acc, bucket) => {
    const items = recommendations.filter((r) => r.bucket === bucket)
    if (items.length > 0) acc[bucket] = items
    return acc
  }, {})

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Your Dental Care Options
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Based on your needs, here are the clinics we recommend. Call to confirm availability and
        schedule an appointment.
      </Typography>

      {BUCKET_ORDER.map((bucket) => {
        const items = grouped[bucket]
        if (!items) return null
        const config = BUCKET_CONFIG[bucket]

        return (
          <Box key={bucket} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              {config.heading}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {config.description}
            </Typography>
            {items.map((rec) => (
              <ClinicCard key={rec.id} rec={rec} sessionId={sessionId} />
            ))}
          </Box>
        )
      })}

      <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
        <Button variant="outlined" href="/intake">
          Start Over
        </Button>
      </Box>
    </Container>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 3 }} />
          <Typography variant="h5">Loading your results...</Typography>
        </Container>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
