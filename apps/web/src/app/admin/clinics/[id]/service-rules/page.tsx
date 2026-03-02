'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Alert from '@mui/material/Alert'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { listSubEntity, updateSubEntity } from '@/lib/admin-api'
import { canWrite } from '@/lib/admin-auth'

const SERVICE_TYPES = [
  'EXAM',
  'XRAY',
  'CLEANING',
  'FILLING',
  'EXTRACTION_SIMPLE',
  'EXTRACTION_SURGICAL',
  'ROOT_CANAL',
  'CROWN',
  'DENTURE_FULL',
  'DENTURE_PARTIAL',
  'EMERGENCY_VISIT',
  'ABSCESS_DRAINAGE',
  'PRESCRIPTION_ONLY',
]

const INSURANCE_TYPES = [
  'MEDICAID',
  'MEDICARE',
  'DUAL_MEDICAID_MEDICARE',
  'PRIVATE',
  'UNINSURED_SELF_PAY',
  'NOT_SURE',
]

const ACCEPTS_OPTIONS = ['YES', 'NO', 'LIMITED', 'UNKNOWN']

interface ServiceRuleRow {
  serviceType: string
  insuranceType: string
  accepts: string
  newPatientsOnly: boolean
  conditionsText: string
}

function emptyRow(): ServiceRuleRow {
  return {
    serviceType: 'EXAM',
    insuranceType: 'MEDICAID',
    accepts: 'UNKNOWN',
    newPatientsOnly: false,
    conditionsText: '',
  }
}

export default function ServiceRulesEditorPage() {
  const params = useParams()
  const clinicId = params.id as string
  const [rows, setRows] = useState<ServiceRuleRow[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const writable = canWrite()

  useEffect(() => {
    async function load() {
      try {
        const res = await listSubEntity<ServiceRuleRow>(clinicId, 'service-rules')
        setRows(res.data)
      } catch {
        setError('Failed to load service rules')
      }
    }
    load()
  }, [clinicId])

  function updateRow(index: number, field: keyof ServiceRuleRow, value: unknown) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await updateSubEntity(clinicId, 'service-rules', rows)
      setRows(res.data)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Service Rules (Overrides)</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {writable && (
            <>
              <Button startIcon={<AddIcon />} onClick={() => setRows([...rows, emptyRow()])}>
                Add Rule
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Granular service + insurance acceptance overrides. These take precedence over the general
        access rules.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Service rules saved
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {rows.map((row, i) => (
        <Card key={i} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  label="Service"
                  select
                  fullWidth
                  value={row.serviceType}
                  onChange={(e) => updateRow(i, 'serviceType', e.target.value)}
                  disabled={!writable}
                >
                  {SERVICE_TYPES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  label="Insurance"
                  select
                  fullWidth
                  value={row.insuranceType}
                  onChange={(e) => updateRow(i, 'insuranceType', e.target.value)}
                  disabled={!writable}
                >
                  {INSURANCE_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  label="Accepts"
                  select
                  fullWidth
                  value={row.accepts}
                  onChange={(e) => updateRow(i, 'accepts', e.target.value)}
                  disabled={!writable}
                >
                  {ACCEPTS_OPTIONS.map((a) => (
                    <MenuItem key={a} value={a}>
                      {a}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row.newPatientsOnly}
                      onChange={(e) => updateRow(i, 'newPatientsOnly', e.target.checked)}
                      disabled={!writable}
                    />
                  }
                  label="New Only"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Conditions"
                  fullWidth
                  value={row.conditionsText}
                  onChange={(e) => updateRow(i, 'conditionsText', e.target.value)}
                  disabled={!writable}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 1 }}>
                {writable && (
                  <IconButton
                    color="error"
                    onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {rows.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No service rule overrides configured
        </Typography>
      )}
    </>
  )
}
