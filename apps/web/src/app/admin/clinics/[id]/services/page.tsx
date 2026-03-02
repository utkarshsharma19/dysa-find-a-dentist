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

interface ServiceRow {
  serviceType: string
  availableForMedicaid: boolean
  availableForUninsured: boolean
  availableForPrivate: boolean
  newPatientsAccepted: boolean
  notes: string
}

function emptyRow(): ServiceRow {
  return {
    serviceType: 'EXAM',
    availableForMedicaid: false,
    availableForUninsured: false,
    availableForPrivate: true,
    newPatientsAccepted: true,
    notes: '',
  }
}

export default function ServicesEditorPage() {
  const params = useParams()
  const clinicId = params.id as string
  const [rows, setRows] = useState<ServiceRow[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const writable = canWrite()

  useEffect(() => {
    async function load() {
      try {
        const res = await listSubEntity<ServiceRow>(clinicId, 'services')
        setRows(res.data)
      } catch {
        setError('Failed to load services')
      }
    }
    load()
  }, [clinicId])

  function updateRow(index: number, field: keyof ServiceRow, value: unknown) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await updateSubEntity(clinicId, 'services', rows)
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
        <Typography variant="h5">Clinic Services</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {writable && (
            <>
              <Button startIcon={<AddIcon />} onClick={() => setRows([...rows, emptyRow()])}>
                Add Service
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Services saved
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
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Service Type"
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
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row.availableForMedicaid}
                      onChange={(e) => updateRow(i, 'availableForMedicaid', e.target.checked)}
                      disabled={!writable}
                    />
                  }
                  label="Medicaid"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row.availableForUninsured}
                      onChange={(e) => updateRow(i, 'availableForUninsured', e.target.checked)}
                      disabled={!writable}
                    />
                  }
                  label="Uninsured"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row.availableForPrivate}
                      onChange={(e) => updateRow(i, 'availableForPrivate', e.target.checked)}
                      disabled={!writable}
                    />
                  }
                  label="Private"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={row.newPatientsAccepted}
                      onChange={(e) => updateRow(i, 'newPatientsAccepted', e.target.checked)}
                      disabled={!writable}
                    />
                  }
                  label="New Patients"
                />
              </Grid>
              <Grid size={{ xs: 11, md: 1 }}>
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
          No services configured
        </Typography>
      )}
    </>
  )
}
