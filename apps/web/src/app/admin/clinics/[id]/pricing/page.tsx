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

const PRICING_MODELS = [
  'FLAT',
  'SLIDING_SCALE',
  'DONATION_BASED',
  'MEDICAID_RATE',
  'VARIES',
  'UNKNOWN',
]
const CONFIDENCE_LEVELS = [
  'VERIFIED_RECENTLY',
  'VERIFIED_OLD',
  'USER_REPORTED',
  'ESTIMATED',
  'UNKNOWN',
]

interface PricingRow {
  serviceType: string
  priceMin: string
  priceMax: string
  pricingModel: string
  conditionsText: string
  medicaidCopay: string
  confidence: string
}

function emptyRow(): PricingRow {
  return {
    serviceType: 'EXAM',
    priceMin: '',
    priceMax: '',
    pricingModel: 'UNKNOWN',
    conditionsText: '',
    medicaidCopay: '',
    confidence: 'UNKNOWN',
  }
}

export default function PricingEditorPage() {
  const params = useParams()
  const clinicId = params.id as string
  const [rows, setRows] = useState<PricingRow[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const writable = canWrite()

  useEffect(() => {
    async function load() {
      try {
        const res = await listSubEntity<PricingRow>(clinicId, 'pricing')
        setRows(res.data)
      } catch {
        setError('Failed to load pricing')
      }
    }
    load()
  }, [clinicId])

  function updateRow(index: number, field: keyof PricingRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await updateSubEntity(clinicId, 'pricing', rows)
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
        <Typography variant="h5">Pricing</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {writable && (
            <>
              <Button startIcon={<AddIcon />} onClick={() => setRows([...rows, emptyRow()])}>
                Add Row
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
          Pricing saved
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
              <Grid size={{ xs: 6, md: 1 }}>
                <TextField
                  label="Min $"
                  fullWidth
                  value={row.priceMin}
                  onChange={(e) => updateRow(i, 'priceMin', e.target.value)}
                  disabled={!writable}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 1 }}>
                <TextField
                  label="Max $"
                  fullWidth
                  value={row.priceMax}
                  onChange={(e) => updateRow(i, 'priceMax', e.target.value)}
                  disabled={!writable}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  label="Model"
                  select
                  fullWidth
                  value={row.pricingModel}
                  onChange={(e) => updateRow(i, 'pricingModel', e.target.value)}
                  disabled={!writable}
                >
                  {PRICING_MODELS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, md: 1 }}>
                <TextField
                  label="Copay"
                  fullWidth
                  value={row.medicaidCopay}
                  onChange={(e) => updateRow(i, 'medicaidCopay', e.target.value)}
                  disabled={!writable}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  label="Confidence"
                  select
                  fullWidth
                  value={row.confidence}
                  onChange={(e) => updateRow(i, 'confidence', e.target.value)}
                  disabled={!writable}
                >
                  {CONFIDENCE_LEVELS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
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
          No pricing configured
        </Typography>
      )}
    </>
  )
}
