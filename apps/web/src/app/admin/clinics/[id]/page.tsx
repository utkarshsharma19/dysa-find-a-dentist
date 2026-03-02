'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { getClinic, updateClinic, type ClinicDetail } from '@/lib/admin-api'
import { canWrite } from '@/lib/admin-auth'

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

const YES_NO_UNKNOWN = ['YES', 'NO', 'UNKNOWN']

const SUB_TABS = [
  { label: 'Basics', href: '' },
  { label: 'Hours', href: '/hours' },
  { label: 'Services', href: '/services' },
  { label: 'Access Rules', href: '/access-rules' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Intake Channels', href: '/intake-channels' },
  { label: 'Service Rules', href: '/service-rules' },
  { label: 'Sources', href: '/sources' },
]

export default function ClinicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clinicId = params.id as string
  const [clinic, setClinic] = useState<ClinicDetail | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)
  const writable = canWrite()

  useEffect(() => {
    async function load() {
      try {
        const res = await getClinic(clinicId)
        setClinic(res.clinic)
      } catch {
        setError('Failed to load clinic')
      }
    }
    load()
  }, [clinicId])

  function handleTabChange(_: unknown, newValue: number) {
    if (newValue === 0) {
      setTab(0)
    } else {
      router.push(`/admin/clinics/${clinicId}${SUB_TABS[newValue].href}`)
    }
  }

  async function handleSave() {
    if (!clinic) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await updateClinic(clinicId, clinic)
      setClinic(res.clinic)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function update(field: keyof ClinicDetail, value: unknown) {
    if (!clinic) return
    setClinic({ ...clinic, [field]: value })
    setSuccess(false)
  }

  if (!clinic) return <Typography>Loading...</Typography>

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">{clinic.name}</Typography>
        {writable && (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Clinic saved successfully
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {SUB_TABS.map((t) => (
          <Tab key={t.label} label={t.label} />
        ))}
      </Tabs>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Name"
                fullWidth
                value={clinic.name}
                onChange={(e) => update('name', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Clinic Type"
                fullWidth
                select
                value={clinic.clinicType}
                onChange={(e) => update('clinicType', e.target.value)}
                disabled={!writable}
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
                value={clinic.address ?? ''}
                onChange={(e) => update('address', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="City"
                fullWidth
                value={clinic.city ?? ''}
                onChange={(e) => update('city', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="State"
                fullWidth
                value={clinic.state ?? 'MD'}
                onChange={(e) => update('state', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="ZIP"
                fullWidth
                value={clinic.zip ?? ''}
                onChange={(e) => update('zip', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="County"
                fullWidth
                value={clinic.county ?? ''}
                onChange={(e) => update('county', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Latitude"
                fullWidth
                type="number"
                value={clinic.lat ?? ''}
                onChange={(e) => update('lat', e.target.value ? Number(e.target.value) : null)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Longitude"
                fullWidth
                type="number"
                value={clinic.lng ?? ''}
                onChange={(e) => update('lng', e.target.value ? Number(e.target.value) : null)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Phone"
                fullWidth
                value={clinic.phone ?? ''}
                onChange={(e) => update('phone', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Phone (Secondary)"
                fullWidth
                value={clinic.phoneSecondary ?? ''}
                onChange={(e) => update('phoneSecondary', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Website URL"
                fullWidth
                value={clinic.websiteUrl ?? ''}
                onChange={(e) => update('websiteUrl', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Intake URL"
                fullWidth
                value={clinic.intakeUrl ?? ''}
                onChange={(e) => update('intakeUrl', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="ADA Accessible"
                fullWidth
                select
                value={clinic.adaAccessible ?? 'UNKNOWN'}
                onChange={(e) => update('adaAccessible', e.target.value)}
                disabled={!writable}
              >
                {YES_NO_UNKNOWN.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Parking Available"
                fullWidth
                select
                value={clinic.parkingAvailable ?? 'UNKNOWN'}
                onChange={(e) => update('parkingAvailable', e.target.value)}
                disabled={!writable}
              >
                {YES_NO_UNKNOWN.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={clinic.nearTransitStop ?? false}
                    onChange={(e) => update('nearTransitStop', e.target.checked)}
                    disabled={!writable}
                  />
                }
                label="Near Transit Stop"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={clinic.active}
                    onChange={(e) => update('active', e.target.checked)}
                    disabled={!writable}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Internal Notes"
                fullWidth
                multiline
                rows={3}
                value={clinic.notesInternal ?? ''}
                onChange={(e) => update('notesInternal', e.target.value)}
                disabled={!writable}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
}
