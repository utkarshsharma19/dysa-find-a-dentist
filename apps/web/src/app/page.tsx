'use client'

import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import SearchIcon from '@mui/icons-material/Search'
import CalculateIcon from '@mui/icons-material/Calculate'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import Link from 'next/link'
import { Disclaimer } from '@/components/Disclaimer'

const FEATURES: Array<{
  icon: React.ReactElement
  title: string
  body: string
  href: string
  cta: string
}> = [
  {
    icon: <SearchIcon fontSize="large" />,
    title: 'Find a clinic',
    body: 'Answer a few questions and we match you with Maryland clinics that accept your insurance and can see you soon.',
    href: '/intake',
    cta: 'Start intake',
  },
  {
    icon: <CalculateIcon fontSize="large" />,
    title: 'Estimate cost',
    body: 'Pick your state, insurance, and procedures. Get a realistic out-of-pocket range before you call.',
    href: '/cost-estimator',
    cta: 'Open estimator',
  },
  {
    icon: <SmartToyIcon fontSize="large" />,
    title: 'Book with AI',
    body: 'Free unlimited chat with an AI assistant powered by DSPy + Gemini. Books and reschedules for you.',
    href: '/cost-estimator',
    cta: 'Meet the assistant',
  },
]

export default function HomePage() {
  return (
    <>
      <Box
        sx={{
          background: (t) =>
            `linear-gradient(140deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
          color: 'primary.contrastText',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="flex-start">
            <Stack direction="row" alignItems="center" spacing={1} sx={{ opacity: 0.85 }}>
              <LocalHospitalIcon fontSize="small" />
              <Typography variant="overline">Dental access, simplified</Typography>
            </Stack>
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.1 }}>
              Find dental care. Know the cost.
              <br />
              Book in a chat.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.92, maxWidth: 640 }}>
              DYSA connects you with vetted clinics, estimates your out-of-pocket cost, and lets an
              AI assistant book the appointment — on the web or over WhatsApp.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
              <Button
                component={Link}
                href="/intake"
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<SearchIcon />}
                sx={{
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Find a clinic
              </Button>
              <Button
                component={Link}
                href="/cost-estimator"
                variant="outlined"
                color="inherit"
                size="large"
                startIcon={<CalculateIcon />}
                sx={{ borderColor: 'rgba(255,255,255,0.6)' }}
              >
                Estimate cost
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Disclaimer />
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {FEATURES.map((f) => (
            <Grid key={f.title} size={{ xs: 12, md: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform .18s, box-shadow .18s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1.5 }}>{f.icon}</Box>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {f.body}
                </Typography>
                <Button component={Link} href={f.href} sx={{ mt: 2, alignSelf: 'flex-start' }}>
                  {f.cta} →
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 6,
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: 'secondary.dark',
            color: 'primary.contrastText',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            gap: 3,
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 48, color: '#25D366' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" sx={{ mb: 1 }}>
              Prefer WhatsApp? We meet you there.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Our bot handles booking, reschedules, and reminders in English, Hindi, and Hinglish —
              with clinical-escalation safety built in.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/cost-estimator"
            variant="contained"
            sx={{ bgcolor: '#25D366', color: '#0b2b14', '&:hover': { bgcolor: '#1fc15d' } }}
            size="large"
          >
            Try it
          </Button>
        </Paper>
      </Container>
    </>
  )
}
