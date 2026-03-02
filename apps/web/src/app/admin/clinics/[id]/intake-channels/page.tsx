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

const CHANNEL_TYPES = ['PHONE', 'ONLINE_PORTAL', 'WALK_IN', 'REFERRAL_ONLY', 'APP']

interface ChannelRow {
  channel: string
  detailsText: string
  onlineLink: string
}

function emptyRow(): ChannelRow {
  return { channel: 'PHONE', detailsText: '', onlineLink: '' }
}

export default function IntakeChannelsEditorPage() {
  const params = useParams()
  const clinicId = params.id as string
  const [rows, setRows] = useState<ChannelRow[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const writable = canWrite()

  useEffect(() => {
    async function load() {
      try {
        const res = await listSubEntity<ChannelRow>(clinicId, 'intake-channels')
        setRows(res.data)
      } catch {
        setError('Failed to load intake channels')
      }
    }
    load()
  }, [clinicId])

  function updateRow(index: number, field: keyof ChannelRow, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await updateSubEntity(clinicId, 'intake-channels', rows)
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
        <Typography variant="h5">Intake Channels</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {writable && (
            <>
              <Button startIcon={<AddIcon />} onClick={() => setRows([...rows, emptyRow()])}>
                Add Channel
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
          Intake channels saved
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
                  label="Channel"
                  select
                  fullWidth
                  value={row.channel}
                  onChange={(e) => updateRow(i, 'channel', e.target.value)}
                  disabled={!writable}
                >
                  {CHANNEL_TYPES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Details"
                  fullWidth
                  value={row.detailsText}
                  onChange={(e) => updateRow(i, 'detailsText', e.target.value)}
                  disabled={!writable}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Online Link"
                  fullWidth
                  value={row.onlineLink}
                  onChange={(e) => updateRow(i, 'onlineLink', e.target.value)}
                  disabled={!writable}
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
          No intake channels configured
        </Typography>
      )}
    </>
  )
}
