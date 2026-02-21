import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function IntakePage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h2">Tell us about your situation</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Intake form will be implemented in PR-FE-002 and PR-FE-003.
      </Typography>
    </Container>
  )
}
