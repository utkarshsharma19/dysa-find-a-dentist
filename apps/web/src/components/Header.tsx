'use client'

import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AuthDialog } from './AuthDialog'

const NAV = [
  { href: '/intake', label: 'Find a clinic' },
  { href: '/cost-estimator', label: 'Cost estimator' },
  { href: '/diagnose', label: 'AI screening' },
  { href: '/emergency', label: 'Emergency' },
]

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <AppBar
      position="sticky"
      color="primary"
      elevation={0}
      sx={{ borderBottom: '1px solid', borderColor: 'rgba(255,255,255,0.12)' }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LocalHospitalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
            DYSA Dental
          </Typography>
        </Link>

        <Stack
          direction="row"
          spacing={1}
          sx={{ ml: 3, display: { xs: 'none', md: 'flex' }, flex: 1 }}
        >
          {NAV.map((n) => (
            <Button
              key={n.href}
              component={Link}
              href={n.href}
              color="inherit"
              sx={{
                opacity: isActive(n.href) ? 1 : 0.85,
                borderBottom: isActive(n.href)
                  ? '2px solid rgba(255,255,255,0.9)'
                  : '2px solid transparent',
                borderRadius: 0,
                px: 1.5,
              }}
            >
              {n.label}
            </Button>
          ))}
        </Stack>

        <Box sx={{ flex: 1, display: { xs: 'block', md: 'none' } }} />

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          {user ? (
            <>
              <Button
                color="inherit"
                startIcon={<AccountCircleIcon />}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ textTransform: 'none' }}
              >
                {user.name ?? user.email}
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null)
                    logout()
                  }}
                >
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Sign out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => setAuthOpen(true)}
              sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Sign in
            </Button>
          )}
        </Box>

        <IconButton
          color="inherit"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {NAV.map((n) => (
              <ListItemButton
                key={n.href}
                component={Link}
                href={n.href}
                selected={isActive(n.href)}
              >
                <ListItemText primary={n.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            {user ? (
              <>
                <ListItemButton disabled>
                  <ListItemText primary={user.name ?? user.email} secondary="Signed in" />
                </ListItemButton>
                <ListItemButton onClick={logout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  <ListItemText primary="Sign out" />
                </ListItemButton>
              </>
            ) : (
              <ListItemButton onClick={() => setAuthOpen(true)}>
                <ListItemText primary="Sign in / Sign up" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} initialMode="signin" />
    </AppBar>
  )
}
