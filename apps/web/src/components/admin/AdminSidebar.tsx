'use client'

import { usePathname, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import VerifiedIcon from '@mui/icons-material/Verified'
import LogoutIcon from '@mui/icons-material/Logout'
import { clearAuth, getAdminUser } from '@/lib/admin-auth'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
  { label: 'Clinics', href: '/admin/clinics', icon: <LocalHospitalIcon /> },
  { label: 'Verification', href: '/admin/verification', icon: <VerifiedIcon /> },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getAdminUser()

  function handleLogout() {
    clearAuth()
    router.push('/admin/login')
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          DYSA Admin
        </Typography>
        {user && (
          <Typography variant="caption" color="text.secondary">
            {user.displayName} ({user.role})
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.href}
            selected={
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            }
            onClick={() => router.push(item.href)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <List>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  )
}
