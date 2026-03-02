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
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { listSubEntity, updateSubEntity } from '@/lib/admin-api'
import { canWrite } from '@/lib/admin-auth'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface HourRow {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isWalkInHours: boolean
  walkInStart: string
  walkInEnd: string
  notes: string
}

function emptyRow(): HourRow {
  return {
    dayOfWeek: 1,
    openTime: '08:00',
    closeTime: '17:00',
    isWalkInHours: false,
    walkInStart: '',
    walkInEnd: '',
    notes: '',
  }
}

export default function HoursEditorPage() {
  const params = useParams()
  const clinicId = params.id as string
  const [rows, setRows] = useState<HourRow[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const writable = canWrite()

  useEffect(() => {
    async function load() {
      try {
        const res = await listSubEntity<HourRow>(clinicId, 'hours')
        setRows(res.data.length > 0 ? res.data : [])
      } catch {
        setError('Failed to load hours')
      }
    }
    load()
  }, [clinicId])

  function updateRow(index: number, field: keyof HourRow, value: unknown) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await updateSubEntity(clinicId, 'hours', rows)
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
        <Typography variant="h5">Clinic Hours</Typography>
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
          Hours saved
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
                  label="Day"
                  select
                  fullWidth
                  value={row.dayOfWeek}
                  onChange={(e) => updateRow(i, 'dayOfWeek', Number(e.target.value))}
                  disabled={!writable}
                >
                  {DAYS.map((d, idx) => (
                    <MenuItem key={idx} value={idx}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  label="Open"
                  type="time"
                  fullWidth
                  value={row.openTime}
                  onChange={(e) => updateRow(i, 'openTime', e.target.value)}
                  disabled={!writable}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  label="Close"
                  type="time"
                  fullWidth
                  value={row.closeTime}
                  onChange={(e) => updateRow(i, 'closeTime', e.target.value)}
                  disabled={!writable}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={row.isWalkInHours}
                      onChange={(e) => updateRow(i, 'isWalkInHours', e.target.checked)}
                      disabled={!writable}
                    />
                  }
                  label="Walk-in"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Notes"
                  fullWidth
                  value={row.notes}
                  onChange={(e) => updateRow(i, 'notes', e.target.value)}
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
          No hours configured
        </Typography>
      )}
    </>
  )
}
