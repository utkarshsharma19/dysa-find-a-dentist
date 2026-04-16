'use client'

import { useEffect, useRef, useState } from 'react'
import Fab from '@mui/material/Fab'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useAuth } from '@/lib/auth-context'
import { whatsupdoc, WhatsUpDocError } from '@/lib/whatsupdoc'
import { AuthDialog } from './AuthDialog'

interface Message {
  role: 'me' | 'bot'
  text: string
}

const QUICK_REPLIES = [
  "I'd like to book a cleaning tomorrow morning",
  'When are you available this week?',
  'Check my appointments',
]

interface ChatFabProps {
  context?: Record<string, unknown>
}

export function ChatFab({ context }: ChatFabProps) {
  const { token, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [firstSend, setFirstSend] = useState(true)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Reset transcript when user identity changes.
  useEffect(() => {
    setMessages([])
    setFirstSend(true)
  }, [user?.id])

  // Auto-scroll on new messages.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy, open])

  function openChat() {
    if (!token) {
      setAuthOpen(true)
      return
    }
    setOpen(true)
    if (messages.length === 0) {
      setMessages([
        {
          role: 'bot',
          text: `Hi ${user?.name?.split(' ')[0] ?? 'there'}! I'm your dental booking assistant. Tell me what you'd like to book, reschedule, or check.`,
        },
      ])
    }
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || busy) return
    if (!token) {
      setAuthOpen(true)
      return
    }
    setMessages((m) => [...m, { role: 'me', text: msg }])
    setInput('')
    setBusy(true)
    try {
      const res = await whatsupdoc.chat(token, {
        message: msg,
        context: firstSend && context ? context : undefined,
      })
      setFirstSend(false)
      const replies = res.replies?.length ? res.replies : ['(no reply)']
      setMessages((m) => [...m, ...replies.map((r) => ({ role: 'bot' as const, text: r }))])
    } catch (err) {
      const description =
        err instanceof WhatsUpDocError
          ? err.message
          : 'Network error — is the assistant backend running?'
      setMessages((m) => [...m, { role: 'bot', text: `⚠️ ${description}` }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Fab
        color="primary"
        aria-label="Open AI dental assistant"
        onClick={() => (open ? setOpen(false) : openChat())}
        sx={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          boxShadow: '0 12px 32px rgba(21,101,192,0.35)',
          zIndex: 1300,
        }}
      >
        {open ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
      </Fab>

      {open && (
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            right: { xs: 12, sm: 24 },
            bottom: { xs: 88, sm: 96 },
            width: { xs: 'calc(100vw - 24px)', sm: 400 },
            height: { xs: '70vh', sm: 580 },
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1300,
            animation: 'fadein .22s ease',
            '@keyframes fadein': {
              from: { opacity: 0, transform: 'translateY(12px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              background: (t) =>
                `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
              <AutoAwesomeIcon fontSize="small" />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Dental Booking Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                DSPy + Gemini · free for members
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'inherit' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {!token ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                bgcolor: 'background.default',
                px: 3,
                textAlign: 'center',
              }}
            >
              <LockOutlinedIcon color="disabled" fontSize="large" />
              <Typography variant="body1">Sign in to start chatting.</Typography>
              <Typography variant="body2" color="text.secondary">
                Free, unlimited access to the assistant once you have an account.
              </Typography>
              <Button variant="contained" onClick={() => setAuthOpen(true)}>
                Sign in / Sign up
              </Button>
            </Box>
          ) : (
            <>
              <Box
                ref={scrollRef}
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  bgcolor: 'background.default',
                  px: 2,
                  py: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {messages.map((m, i) => (
                  <Box
                    key={i}
                    sx={{
                      alignSelf: m.role === 'me' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      px: 1.75,
                      py: 1.25,
                      borderRadius: 2.5,
                      bgcolor: m.role === 'me' ? 'primary.main' : 'background.paper',
                      color: m.role === 'me' ? 'primary.contrastText' : 'text.primary',
                      border: m.role === 'bot' ? '1px solid' : 'none',
                      borderColor: 'divider',
                      borderBottomRightRadius: m.role === 'me' ? 4 : undefined,
                      borderBottomLeftRadius: m.role === 'bot' ? 4 : undefined,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: 14.5,
                      lineHeight: 1.5,
                      boxShadow: m.role === 'me' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {m.text}
                  </Box>
                ))}
                {busy && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignSelf: 'flex-start',
                      color: 'text.secondary',
                      alignItems: 'center',
                      pl: 1,
                    }}
                  >
                    <CircularProgress size={12} />
                    <Typography variant="caption">assistant is typing…</Typography>
                  </Stack>
                )}
              </Box>

              <Stack
                direction="row"
                spacing={1}
                sx={{ px: 2, pb: 1, flexWrap: 'wrap', gap: 1, rowGap: 1 }}
              >
                {QUICK_REPLIES.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    size="small"
                    onClick={() => send(q)}
                    sx={{ cursor: 'pointer' }}
                    disabled={busy}
                  />
                ))}
              </Stack>

              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault()
                  void send()
                }}
                sx={{
                  display: 'flex',
                  gap: 1,
                  p: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Tell me what you need…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoFocus
                  disabled={busy}
                />
                <IconButton type="submit" color="primary" disabled={busy || !input.trim()}>
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      )}

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} initialMode="signin" />
    </>
  )
}
