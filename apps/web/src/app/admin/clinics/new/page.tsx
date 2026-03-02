'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import { createClinic } from '@/lib/admin-api'

const CLINIC_TYPES = [
  'FQHC',
  'DENTAL_SCHOOL',
  'NONPROFIT',
  'FREE_CLINIC',
  'HOSPITAL_ED',
  'HOSPITAL_CLINIC',
  'MOBILE_UNIT',
  'PRIVATE_MEDICAID',
  'COUNTY_HEALTH_DEPT',
  'OTHER',
]

export default function NewClinicPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [clinicType, setClinicType] = useState('FQHC')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [county, setCounty] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await createClinic({
        name,
        clinicType,
        address: address || null,
        city: city || null,
        state: 'MD',
        zip: zip || null,
        county: county || null,
        phone: phone || null,
      })
      router.push(`/admin/clinics/${res.clinic.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        New Clinic
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Name"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Clinic Type"
                  fullWidth
                  select
                  value={clinicType}
                  onChange={(e) => setClinicType(e.target.value)}
                >
                  {CLINIC_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Address"
                  fullWidth
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="City"
                  fullWidth
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="ZIP"
                  fullWidth
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="County"
                  fullWidth
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Clinic'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </>
  )
}
