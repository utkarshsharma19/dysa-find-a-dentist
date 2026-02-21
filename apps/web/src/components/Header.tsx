'use client'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import Link from 'next/link'

export function Header() {
  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LocalHospitalIcon sx={{ mr: 1 }} />
          <Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              Maryland Dental Access Navigator
            </Typography>
          </Box>
        </Link>
      </Toolbar>
    </AppBar>
  )
}
