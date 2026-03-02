'use client'

import { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { listClinics } from '@/lib/admin-api'

export default function AdminDashboardPage() {
  const [totalClinics, setTotalClinics] = useState<number | null>(null)
  const [activeClinics, setActiveClinics] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [all, active] = await Promise.all([
          listClinics({ pageSize: 1 }),
          listClinics({ pageSize: 1, active: true }),
        ])
        setTotalClinics(all.total)
        setActiveClinics(active.total)
      } catch {
        // API may not be available yet
      }
    }
    load()
  }, [])

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Clinics
              </Typography>
              <Typography variant="h3">{totalClinics ?? '—'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Clinics
              </Typography>
              <Typography variant="h3">{activeClinics ?? '—'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Inactive Clinics
              </Typography>
              <Typography variant="h3">
                {totalClinics != null && activeClinics != null ? totalClinics - activeClinics : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
