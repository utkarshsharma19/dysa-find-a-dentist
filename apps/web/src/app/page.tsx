import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Link from 'next/link'
import { Disclaimer } from '@/components/Disclaimer'

export default function HomePage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Disclaimer />
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h1" gutterBottom>
          Find Dental Care in Maryland
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Answer a few quick questions and we will match you with dental clinics that accept your
          insurance, are near you, and can see you soon.
        </Typography>
        <Button
          component={Link}
          href="/intake"
          variant="contained"
          size="large"
          sx={{ px: 6, py: 1.5 }}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  )
}
