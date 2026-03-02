'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import AddIcon from '@mui/icons-material/Add'
import { listClinics, type ClinicListItem } from '@/lib/admin-api'

export default function ClinicsListPage() {
  const router = useRouter()
  const [clinics, setClinics] = useState<ClinicListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listClinics({
        page: page + 1,
        pageSize,
        search: search || undefined,
      })
      setClinics(res.data)
      setTotal(res.total)
    } catch {
      // handle error silently
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clinics</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/admin/clinics/new')}
        >
          Add Clinic
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name, city, county, or zip..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          sx={{ width: 400 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>City</TableCell>
              <TableCell>County</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Verified</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clinics.map((clinic) => (
              <TableRow
                key={clinic.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/admin/clinics/${clinic.id}`)}
              >
                <TableCell>{clinic.name}</TableCell>
                <TableCell>{clinic.clinicType}</TableCell>
                <TableCell>{clinic.city ?? '—'}</TableCell>
                <TableCell>{clinic.county ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={clinic.active ? 'Active' : 'Inactive'}
                    color={clinic.active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {clinic.lastVerifiedAt
                    ? new Date(clinic.lastVerifiedAt).toLocaleDateString()
                    : 'Never'}
                </TableCell>
              </TableRow>
            ))}
            {!loading && clinics.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No clinics found
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
