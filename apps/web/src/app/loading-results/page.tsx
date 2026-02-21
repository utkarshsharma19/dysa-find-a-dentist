import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function LoadingResultsPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <CircularProgress size={48} sx={{ mb: 3 }} />
      <Typography variant="h2">Finding your best options...</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          We are matching you with clinics based on your needs. This usually takes a few seconds.
        </Typography>
      </Box>
    </Container>
  )
}
