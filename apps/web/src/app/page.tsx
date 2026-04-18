'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import BiotechIcon from '@mui/icons-material/Biotech'
import CalculateIcon from '@mui/icons-material/Calculate'
import SearchIcon from '@mui/icons-material/Search'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import Link from 'next/link'
import { DentalOrbitScene } from '@/components/DentalOrbitScene'
import { Disclaimer } from '@/components/Disclaimer'

const ROUTES = [
  {
    icon: <SearchIcon />,
    label: 'Find care',
    href: '/intake',
    title: 'Match with clinics that can actually see you.',
    detail: 'Insurance, distance, urgency, language, and access rules in one intake.',
  },
  {
    icon: <CalculateIcon />,
    label: 'Know the range',
    href: '/cost-estimator',
    title: 'Estimate your out-of-pocket before the call.',
    detail: 'Procedure ranges, insurance context, and budget expectations before booking.',
  },
  {
    icon: <BiotechIcon />,
    label: 'Screen a photo',
    href: '/diagnose',
    title: 'Check a close-up image for visible caries signals.',
    detail: 'Fast model feedback with safety copy that does not replace a dental exam.',
  },
]

const SIGNALS = ['Medicaid-aware', 'WhatsApp-ready', 'Urgency routing', 'Cost clarity']

const STEPS = [
  'Tell us what hurts, what coverage you have, and how far you can travel.',
  'See practical care paths, not a directory full of dead ends.',
  'Move from estimate to booking with a chat assistant that keeps the next step clear.',
]

export default function HomePage() {
  return (
    <>
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '76svh', md: '84svh' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: '#f7fffb',
          color: '#111816',
          borderBottom: '1px solid rgba(11, 71, 62, 0.16)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(110deg, rgba(247,255,251,0.98) 0%, rgba(247,255,251,0.86) 42%, rgba(247,255,251,0.32) 100%)',
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: { xs: 0.36, md: 0.9 },
            transform: {
              xs: 'translate(18%, -10%) scale(1.08)',
              md: 'translate(18%, -4%) scale(1.04)',
            },
          }}
        >
          <DentalOrbitScene />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 7, md: 8 } }}>
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3} alignItems="flex-start">
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {SIGNALS.map((signal) => (
                    <Chip
                      key={signal}
                      label={signal}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(8, 151, 135, 0.1)',
                        color: '#064c43',
                        border: '1px solid rgba(8, 151, 135, 0.22)',
                        borderRadius: 1,
                        fontWeight: 700,
                      }}
                    />
                  ))}
                </Stack>

                <Typography
                  variant="h1"
                  sx={{
                    maxWidth: 760,
                    fontSize: { xs: '2.45rem', sm: '3.5rem', md: '4.8rem' },
                    lineHeight: 0.95,
                    letterSpacing: 0,
                    color: '#0d1714',
                  }}
                >
                  Dental care without phone tag.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: 640,
                    color: '#314b45',
                    fontSize: { xs: '1rem', md: '1.12rem' },
                    lineHeight: 1.7,
                  }}
                >
                  Find clinics, estimate cost, screen a close-up photo, and move toward a booking
                  with fewer dead ends.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
                  <Button
                    component={Link}
                    href="/intake"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: '#0b8f7c',
                      color: '#ffffff',
                      px: 3,
                      py: 1.35,
                      borderRadius: 1,
                      boxShadow: '0 18px 40px rgba(8, 143, 124, 0.28)',
                      '&:hover': { bgcolor: '#087868' },
                    }}
                  >
                    Find a clinic
                  </Button>
                  <Button
                    component={Link}
                    href="/diagnose"
                    variant="outlined"
                    size="large"
                    startIcon={<BiotechIcon />}
                    sx={{
                      color: '#113f39',
                      borderColor: 'rgba(17, 63, 57, 0.34)',
                      px: 3,
                      py: 1.35,
                      borderRadius: 1,
                      bgcolor: 'rgba(255,255,255,0.42)',
                      '&:hover': {
                        borderColor: '#0b8f7c',
                        bgcolor: 'rgba(255,255,255,0.68)',
                      },
                    }}
                  >
                    Try AI screening
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Stack
                spacing={1.5}
                sx={{
                  maxWidth: 420,
                  ml: { md: 'auto' },
                  color: '#0e211d',
                }}
              >
                {ROUTES.map((route, index) => (
                  <Box
                    key={route.label}
                    component={Link}
                    href={route.href}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'grid',
                      gridTemplateColumns: '42px 1fr',
                      gap: 1.5,
                      alignItems: 'start',
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'rgba(255,255,255,0.72)',
                      border: '1px solid rgba(14, 75, 66, 0.16)',
                      boxShadow: index === 0 ? '0 22px 60px rgba(18, 74, 66, 0.12)' : 'none',
                      backdropFilter: 'blur(16px)',
                      transition:
                        'transform .18s ease, border-color .18s ease, background .18s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        bgcolor: 'rgba(255,255,255,0.9)',
                        borderColor: 'rgba(11, 143, 124, 0.42)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: index === 2 ? '#ffebee' : '#e4fbf5',
                        color: index === 2 ? '#d63d55' : '#087868',
                      }}
                    >
                      {route.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{ color: '#0b8f7c', fontWeight: 800, letterSpacing: 0 }}
                      >
                        {route.label}
                      </Typography>
                      <Typography variant="h3" sx={{ fontSize: '1.05rem', mb: 0.6 }}>
                        {route.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#55706a', lineHeight: 1.55 }}>
                        {route.detail}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#ffffff', py: { xs: 5, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <Stack spacing={1.5}>
              {ROUTES.map((route, index) => (
                <Box
                  key={route.label}
                  component={Link}
                  href={route.href}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'grid',
                    gridTemplateColumns: '42px 1fr',
                    gap: 1.5,
                    alignItems: 'start',
                    p: 2,
                    borderRadius: 1,
                    bgcolor: index === 1 ? '#f2fff9' : '#ffffff',
                    border: '1px solid rgba(14, 75, 66, 0.16)',
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: index === 2 ? '#ffebee' : '#e4fbf5',
                      color: index === 2 ? '#d63d55' : '#087868',
                    }}
                  >
                    {route.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{ color: '#0b8f7c', fontWeight: 800, letterSpacing: 0 }}
                    >
                      {route.label}
                    </Typography>
                    <Typography variant="h3" sx={{ fontSize: '1.05rem', mb: 0.6 }}>
                      {route.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#55706a', lineHeight: 1.55 }}>
                      {route.detail}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
          <Disclaimer />
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {STEPS.map((step, index) => (
              <Grid key={step} size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    minHeight: 190,
                    height: '100%',
                    p: 3,
                    borderRadius: 1,
                    border: '1px solid rgba(17, 24, 22, 0.1)',
                    bgcolor: index === 1 ? '#f2fff9' : '#ffffff',
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: '#e2475b', fontWeight: 800, letterSpacing: 0 }}
                  >
                    0{index + 1}
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: '1.28rem', mt: 1, lineHeight: 1.25 }}>
                    {step}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#f5faf8', py: { xs: 5, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 7 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1400&q=80"
                alt="Dentist reviewing care with a patient"
                sx={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  borderRadius: 1,
                  boxShadow: '0 28px 80px rgba(15, 47, 40, 0.18)',
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2.5}>
                <Typography
                  variant="overline"
                  sx={{ color: '#0b8f7c', fontWeight: 800, letterSpacing: 0 }}
                >
                  from search to scheduled
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '3rem' },
                    lineHeight: 1,
                    color: '#101816',
                  }}
                >
                  The next step should be obvious.
                </Typography>
                <Typography variant="body1" sx={{ color: '#4d625d', lineHeight: 1.75 }}>
                  DYSA keeps the stressful parts together: triage, clinic access, cost ranges,
                  language needs, and appointment handoff.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={Link}
                    href="/cost-estimator"
                    variant="contained"
                    startIcon={<CalculateIcon />}
                    sx={{ bgcolor: '#111816', borderRadius: 1, '&:hover': { bgcolor: '#26312e' } }}
                  >
                    Estimate cost
                  </Button>
                  <Button
                    component={Link}
                    href="/cost-estimator"
                    variant="outlined"
                    startIcon={<WhatsAppIcon />}
                    sx={{ borderRadius: 1, color: '#0b8f7c', borderColor: '#0b8f7c' }}
                  >
                    Open chat
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}
