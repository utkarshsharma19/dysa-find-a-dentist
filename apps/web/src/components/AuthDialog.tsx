'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { useAuth } from '@/lib/auth-context'

type Mode = 'signin' | 'signup'

interface Props {
  open: boolean
  onClose: () => void
  initialMode?: Mode
}

export function AuthDialog({ open, onClose, initialMode = 'signin' }: Props) {
  const { login, signup, loading } = useAuth()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (isSignup) await signup({ name, email, password })
      else await login({ email, password })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>
          <Typography variant="overline" color="primary">
            {isSignup ? 'Create account' : 'Welcome back'}
          </Typography>
          <Typography variant="h2" component="div" sx={{ mt: 0.5 }}>
            {isSignup ? 'Start booking in minutes' : 'Sign in to continue'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Free, unlimited access to our AI dental booking assistant.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            {isSignup && (
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                inputProps={{ minLength: 2 }}
                autoFocus
                fullWidth
              />
            )}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={!isSignup}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              inputProps={{ minLength: isSignup ? 8 : 1 }}
              helperText={isSignup ? 'Minimum 8 characters' : undefined}
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, pb: 3, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}
        >
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Working…' : isSignup ? 'Create account' : 'Sign in'}
          </Button>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button
              type="button"
              onClick={() => setMode(isSignup ? 'signin' : 'signup')}
              size="small"
              sx={{ textTransform: 'none', p: 0, minWidth: 0, verticalAlign: 'baseline' }}
            >
              {isSignup ? 'Sign in' : "Sign up — it's free"}
            </Button>
          </Typography>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
