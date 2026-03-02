'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import { canWrite, getToken } from '@/lib/admin-auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const SOURCE_TYPES = [
  'WEBSITE_SCRAPE',
  'PHONE_VERIFICATION',
  'IN_PERSON_VISIT',
  'USER_OUTCOME_REPORT',
  'PARTNER_DATA_FEED',
  'MEDICAID_DIRECTORY',
  'HRSA_DATA',
  'STAFF_ENTRY',
  'OTHER',
]

interface Source {
  id: string
  sourceType: string
  sourceUrl: string | null
  rawNotes: string | null
  verifiedFields: string[] | null
  capturedAt: string
  capturedBy: string | null
}

export default function SourcesPage() {
  const params = useParams()
  const clinicId = params.id as string
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const writable = canWrite()

  // New source form
  const [sourceType, setSourceType] = useState('STAFF_ENTRY')
  const [sourceUrl, setSourceUrl] = useState('')
  const [rawNotes, setRawNotes] = useState('')
  const [adding, setAdding] = useState(false)

  async function load() {
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/admin/clinics/${clinicId}/sources`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setSources(json.data ?? [])
    } catch {
      setError('Failed to load sources')
    }
  }

  useEffect(() => {
    load()
  }, [clinicId])

  async function handleAdd() {
    setAdding(true)
    setError('')
    setSuccess('')
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/admin/clinics/${clinicId}/sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceType,
          sourceUrl: sourceUrl || null,
          rawNotes: rawNotes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to add source')
      setSourceUrl('')
      setRawNotes('')
      setSuccess('Source added')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Add failed')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = getToken()
      await fetch(`${API_BASE}/admin/sources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      await load()
    } catch {
      setError('Failed to delete source')
    }
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Sources
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {writable && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Add Source
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Type"
                  select
                  fullWidth
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                >
                  {SOURCE_TYPES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="URL"
                  fullWidth
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Notes"
                  fullWidth
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button variant="contained" onClick={handleAdd} disabled={adding} fullWidth>
                  {adding ? 'Adding...' : 'Add'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>URL</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Captured</TableCell>
            <TableCell>By</TableCell>
            {writable && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.id}>
              <TableCell>{source.sourceType}</TableCell>
              <TableCell>{source.sourceUrl ?? '—'}</TableCell>
              <TableCell>{source.rawNotes ?? '—'}</TableCell>
              <TableCell>{new Date(source.capturedAt).toLocaleDateString()}</TableCell>
              <TableCell>{source.capturedBy ?? '—'}</TableCell>
              {writable && (
                <TableCell>
                  <IconButton color="error" size="small" onClick={() => handleDelete(source.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
          {sources.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No sources recorded
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}
