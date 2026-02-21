import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function ResultsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h2">Your Dental Care Options</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Results will be displayed here after matching completes (PR-FE-006).
      </Typography>
    </Container>
  )
}
