'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

export function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, mt: 'auto', bgcolor: 'grey.100' }}>
      <Container maxWidth="md">
        <Typography variant="body2" color="text.secondary" align="center">
          This is not a substitute for professional medical advice. If you have a dental emergency,
          call 911 or visit your nearest emergency room.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Maryland Dental Access Navigator &copy; {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  )
}
