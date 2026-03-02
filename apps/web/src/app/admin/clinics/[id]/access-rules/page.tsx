'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import { canWrite } from '@/lib/admin-auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const ELIGIBILITY_OPTIONS = ['YES', 'NO', 'LIMITED', 'UNKNOWN']
const YES_NO_UNKNOWN = ['YES', 'NO', 'UNKNOWN']
const RESIDENCY_OPTIONS = ['NONE', 'COUNTY_ONLY', 'STATE_ONLY', 'CATCHMENT_AREA', 'UNKNOWN']

interface AccessRulesData {
  acceptsNewAdultPatients: string
  acceptsNewChildPatients: string
  minAgeSeen: number | null
  maxAgeSeen: number | null
  acceptsMedicaidAdults: string
  acceptsMedicaidChildren: string
  acceptsMedicare: string
  uninsuredWelcome: string
  slidingScaleAvailable: string
  seesEmergencyPain: string
  seesSwelling: string
  walkInAllowed: string
  referralRequired: string
  residencyRequirement: string
  residencyAreaText: string
  notesPublic: string
}

const DEFAULTS: AccessRulesData = {
  acceptsNewAdultPatients: 'UNKNOWN',
  acceptsNewChildPatients: 'UNKNOWN',
  minAgeSeen: null,
  maxAgeSeen: null,
  acceptsMedicaidAdults: 'UNKNOWN',
  acceptsMedicaidChildren: 'UNKNOWN',
  acceptsMedicare: 'UNKNOWN',
  uninsuredWelcome: 'UNKNOWN',
  slidingScaleAvailable: 'UNKNOWN',
  seesEmergencyPain: 'UNKNOWN',
  seesSwelling: 'UNKNOWN',
  walkInAllowed: 'UNKNOWN',
  referralRequired: 'UNKNOWN',
  residencyRequirement: 'UNKNOWN',
  residencyAreaText: '',
  notesPublic: '',
}

export default function AccessRulesEditorPage() {
  const params = useParams()
  const clinicId = params.id as string
  const [data, setData] = useState<AccessRulesData>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const writable = canWrite()

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('dysa-admin-token')
        const res = await fetch(`${API_BASE}/admin/clinics/${clinicId}/access-rules`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (json.data) setData({ ...DEFAULTS, ...json.data })
      } catch {
        setError('Failed to load access rules')
      }
    }
    load()
  }, [clinicId])

  function update(field: keyof AccessRulesData, value: unknown) {
    setData((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('dysa-admin-token')
      const res = await fetch(`${API_BASE}/admin/clinics/${clinicId}/access-rules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.data) setData({ ...DEFAULTS, ...json.data })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function selectField(label: string, field: keyof AccessRulesData, options: string[]) {
    return (
      <TextField
        label={label}
        select
        fullWidth
        value={data[field] ?? 'UNKNOWN'}
        onChange={(e) => update(field, e.target.value)}
        disabled={!writable}
      >
        {options.map((v) => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </TextField>
    )
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Access Rules</Typography>
        {writable && (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Access rules saved
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Patient Acceptance
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              {selectField(
                'Accepts New Adult Patients',
                'acceptsNewAdultPatients',
                ELIGIBILITY_OPTIONS,
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {selectField(
                'Accepts New Child Patients',
                'acceptsNewChildPatients',
                ELIGIBILITY_OPTIONS,
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Min Age Seen"
                type="number"
                fullWidth
                value={data.minAgeSeen ?? ''}
                onChange={(e) =>
                  update('minAgeSeen', e.target.value ? Number(e.target.value) : null)
                }
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Max Age Seen"
                type="number"
                fullWidth
                value={data.maxAgeSeen ?? ''}
                onChange={(e) =>
                  update('maxAgeSeen', e.target.value ? Number(e.target.value) : null)
                }
                disabled={!writable}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Insurance
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Medicaid Adults', 'acceptsMedicaidAdults', ELIGIBILITY_OPTIONS)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Medicaid Children', 'acceptsMedicaidChildren', ELIGIBILITY_OPTIONS)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Medicare', 'acceptsMedicare', YES_NO_UNKNOWN)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Uninsured Welcome', 'uninsuredWelcome', ELIGIBILITY_OPTIONS)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Sliding Scale', 'slidingScaleAvailable', YES_NO_UNKNOWN)}
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Access
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Sees Emergency Pain', 'seesEmergencyPain', ELIGIBILITY_OPTIONS)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Sees Swelling', 'seesSwelling', ELIGIBILITY_OPTIONS)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Walk-In Allowed', 'walkInAllowed', ELIGIBILITY_OPTIONS)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Referral Required', 'referralRequired', YES_NO_UNKNOWN)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {selectField('Residency Requirement', 'residencyRequirement', RESIDENCY_OPTIONS)}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Residency Area"
                fullWidth
                value={data.residencyAreaText}
                onChange={(e) => update('residencyAreaText', e.target.value)}
                disabled={!writable}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Public Notes"
                fullWidth
                multiline
                rows={2}
                value={data.notesPublic}
                onChange={(e) => update('notesPublic', e.target.value)}
                disabled={!writable}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
}
