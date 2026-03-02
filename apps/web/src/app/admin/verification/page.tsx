'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'
import { getToken } from '@/lib/admin-auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface VerificationItem {
  id: string
  name: string
  clinicType: string
  city: string | null
  county: string | null
  phone: string | null
  lastVerifiedAt: string | null
  verificationConfidence: string | null
}

export default function VerificationPage() {
  const router = useRouter()
  const [items, setItems] = useState<VerificationItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const token = getToken()
      const params = new URLSearchParams({
        page: String(page + 1),
        pageSize: String(pageSize),
      })
      const res = await fetch(`${API_BASE}/admin/verification?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setItems(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch {
      setError('Failed to load verification queue')
    }
  }, [page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  function daysSince(dateStr: string | null): string {
    if (!dateStr) return 'Never'
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    return `${days}d ago`
  }

  function confidenceColor(conf: string | null): 'success' | 'warning' | 'error' | 'default' {
    switch (conf) {
      case 'VERIFIED_RECENTLY':
        return 'success'
      case 'VERIFIED_OLD':
        return 'warning'
      case 'ESTIMATED':
      case 'USER_REPORTED':
        return 'warning'
      case 'UNKNOWN':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Verification Queue
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Active clinics that have not been verified in the last 90 days, or have never been verified.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Chip label={`${total} clinics need verification`} color="warning" />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>City</TableCell>
              <TableCell>County</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Last Verified</TableCell>
              <TableCell>Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/admin/clinics/${item.id}`)}
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.clinicType}</TableCell>
                <TableCell>{item.city ?? '—'}</TableCell>
                <TableCell>{item.county ?? '—'}</TableCell>
                <TableCell>{item.phone ?? '—'}</TableCell>
                <TableCell>{daysSince(item.lastVerifiedAt)}</TableCell>
                <TableCell>
                  <Chip
                    label={item.verificationConfidence ?? 'UNKNOWN'}
                    color={confidenceColor(item.verificationConfidence)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  All clinics are up to date
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>
    </>
  )
}
