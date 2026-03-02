'use client'

import Box from '@mui/material/Box'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

const DRAWER_WIDTH = 240

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          bgcolor: 'grey.50',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
