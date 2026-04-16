'use client'

import { useEffect, useMemo, useState } from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import SearchIcon from '@mui/icons-material/Search'
import Link from 'next/link'
import {
  CATS,
  PROCS,
  CAT_RANGES,
  TIERS,
  INS_KEYS,
  INS_RATES,
  INS_HAS_MAX,
  INS_DEF_MAX,
  TIER_IDX,
  MS,
  MC,
  SM,
  TL,
  TC,
  STATES,
  catOfProc,
  type InsuranceKey,
} from '@/lib/cost-estimator-data'
import { useAssistantContext } from '@/lib/chat-context'
import { useAuth } from '@/lib/auth-context'
import { AuthDialog } from '@/components/AuthDialog'

const CLINIC_WA = process.env.NEXT_PUBLIC_CLINIC_WA_NUMBER ?? ''

export default function CostEstimatorPage() {
  const { setContext } = useAssistantContext()
  const { token } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  const [st, setSt] = useState<string>('Maryland')
  const [ins, setIns] = useState<InsuranceKey>('No insurance')
  const [aMax, setAMax] = useState<number>(INS_DEF_MAX.PPO ?? 1500)
  const [ded, setDed] = useState<number>(50)
  const [sel, setSel] = useState<Record<number, number>>({})

  const mult = SM[st] ?? 1
  const plan = INS_RATES[ins]
  const mcd = ins === 'Medicaid' ? MS[st] : null

  const { items, tR, tC, tP, warnMsg } = useMemo(() => {
    const rows = (Object.keys(sel).map(Number) as number[]).map((pi) => {
      const p = PROCS[pi]
      const ci = catOfProc(pi)
      const qty = sel[pi]
      const mid = Math.round(p[2] * mult * qty)
      let cov = 0
      let pay = mid
      if (ins === 'Medicaid' && mcd) {
        if (MC[mcd[0]][ci] && p[4] > 0) {
          cov = Math.round(p[4] * qty)
          pay = 0
        }
      } else {
        const ti = TIER_IDX[TIERS[ci] as keyof typeof TIER_IDX]
        const r = plan[ti] ?? 0
        cov = Math.round(mid * r)
        pay = mid - cov
      }
      return { pi, ci, name: p[0], qty, mid, cov, pay }
    })
    let tR = 0
    let tC = 0
    let tP = 0
    for (const r of rows) {
      tR += r.mid
      tC += r.cov
      tP += r.pay
    }
    if (INS_HAS_MAX[ins]) {
      tP += ded
      tC = Math.max(0, tC - ded)
    }
    const cap = INS_HAS_MAX[ins] ? aMax : mcd && mcd[1] ? mcd[1] : 0
    let warnMsg = ''
    if (cap && tC > cap) {
      const ov = tC - cap
      tP += ov
      tC = cap
      warnMsg = `Exceeds $${cap.toLocaleString()} annual cap — +$${ov.toLocaleString()} out of pocket.`
    }
    return { items: rows, tR, tC, tP, warnMsg }
  }, [sel, ins, mult, plan, mcd, aMax, ded])

  // Keep the AI assistant's context synced with calculator state.
  useEffect(() => {
    setContext({
      source: 'cost-estimator',
      state: st,
      insurance: ins,
      total: tP,
      procedures: items.map((r) => r.name),
    })
  }, [st, ins, tP, items, setContext])

  const toggle = (pi: number) =>
    setSel((s) => {
      const n = { ...s }
      if (n[pi]) delete n[pi]
      else n[pi] = 1
      return n
    })
  const setQty = (pi: number, delta: number) =>
    setSel((s) => (s[pi] ? { ...s, [pi]: Math.max(1, Math.min(10, s[pi] + delta)) } : s))

  const waHref = useMemo(() => {
    const lines = ["Hi! I'd like to book a dental appointment."]
    if (items.length) lines.push('Procedures: ' + items.map((r) => r.name).join(', '))
    if (st) lines.push('State: ' + st)
    if (tP > 0) lines.push(`Estimated out-of-pocket: $${tP.toLocaleString()}`)
    const text = encodeURIComponent(lines.join('\n'))
    return CLINIC_WA ? `https://wa.me/${CLINIC_WA}?text=${text}` : `https://wa.me/?text=${text}`
  }, [items, st, tP])

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="overline" color="primary">
          dental cost estimator
        </Typography>
        <Typography variant="h1">How much will your dentist visit cost?</Typography>
        <Typography variant="body1" color="text.secondary">
          Pick your state, insurance, and procedures. Get a realistic range before you call — then
          book on WhatsApp or chat with the AI assistant.
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="State"
            value={st}
            onChange={(e) => setSt(e.target.value)}
            fullWidth
          >
            {STATES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Insurance"
            value={ins}
            onChange={(e) => setIns(e.target.value as InsuranceKey)}
            fullWidth
          >
            {INS_KEYS.map((k) => (
              <MenuItem key={k} value={k}>
                {k}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {mcd && (
          <Alert
            severity={mcd[0] === 'eo' ? 'warning' : 'info'}
            icon={false}
            sx={{ mt: 2, borderLeft: 4, borderColor: TC[mcd[0]] }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: TC[mcd[0]] }} />
              <Typography variant="subtitle2">{TL[mcd[0]]}</Typography>
              <Typography variant="body2" color="text.secondary">
                — {mcd[2]}
              </Typography>
            </Stack>
            {mcd[0] === 'eo' && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                Only emergency extractions covered in {st}.
              </Typography>
            )}
          </Alert>
        )}

        {INS_HAS_MAX[ins] && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Annual max ($)"
              type="number"
              value={aMax}
              onChange={(e) => setAMax(+e.target.value || 0)}
              fullWidth
            />
            <TextField
              label="Deductible ($)"
              type="number"
              value={ded}
              onChange={(e) => setDed(+e.target.value || 0)}
              fullWidth
            />
          </Stack>
        )}
      </Paper>

      <Typography variant="overline" color="primary" sx={{ display: 'block', mb: 1 }}>
        procedures
      </Typography>
      {CATS.map((cat, c) => {
        const isMcd = Boolean(ins === 'Medicaid' && mcd)
        const catOk = isMcd && mcd ? MC[mcd[0]][c] : 1
        let cnt = 0
        for (let pi = CAT_RANGES[c][0]; pi <= CAT_RANGES[c][1]; pi++) if (sel[pi]) cnt++
        return (
          <Accordion key={cat} disableGutters elevation={0} sx={{ bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {cat}
                </Typography>
                {cnt > 0 && <Chip size="small" color="primary" label={cnt} />}
                {isMcd && !catOk && (
                  <Chip size="small" color="error" label="not covered" variant="outlined" />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              {Array.from({ length: CAT_RANGES[c][1] - CAT_RANGES[c][0] + 1 }, (_, k) => {
                const pi = CAT_RANGES[c][0] + k
                const p = PROCS[pi]
                const on = !!sel[pi]
                const adj = Math.round(p[2] * mult)
                return (
                  <Stack
                    key={pi}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      py: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                    }}
                    onClick={() => !on && toggle(pi)}
                  >
                    <Checkbox
                      checked={on}
                      onChange={() => toggle(pi)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        fontWeight: on ? 500 : 400,
                        color: on ? 'text.primary' : 'text.secondary',
                      }}
                    >
                      {p[0]}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                      ${adj}
                    </Typography>
                    {on && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton size="small" onClick={() => setQty(pi, -1)}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 16, textAlign: 'center' }}>
                          {sel[pi]}
                        </Typography>
                        <IconButton size="small" onClick={() => setQty(pi, 1)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>
                )
              })}
            </AccordionDetails>
          </Accordion>
        )
      })}

      <Divider sx={{ my: 4 }} />

      {items.length > 0 ? (
        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
          <Typography variant="overline" color="primary">
            your estimate
          </Typography>
          <Box sx={{ mt: 1 }}>
            {items.map((r) => (
              <Stack
                key={r.pi}
                direction="row"
                alignItems="baseline"
                justifyContent="space-between"
                sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Typography variant="body2">
                  {r.name}
                  {r.qty > 1 && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.disabled"
                      sx={{ ml: 1 }}
                    >
                      ×{r.qty}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {r.cov > 0 ? (
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          color: 'text.disabled',
                          textDecoration: 'line-through',
                          mr: 1.5,
                        }}
                      >
                        ${r.mid.toLocaleString()}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 600 }}
                      >
                        ${r.pay.toLocaleString()}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                    >
                      ${r.pay.toLocaleString()}
                    </Typography>
                  )}
                </Typography>
              </Stack>
            ))}
          </Box>
          {warnMsg && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {warnMsg}
            </Alert>
          )}
          <Box sx={{ mt: 3, pt: 2.5, borderTop: 3, borderColor: 'primary.main' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Retail
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                ${tR.toLocaleString()}
              </Typography>
            </Stack>
            {tC > 0 && (
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="success.main">
                  Covered
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                  −${tC.toLocaleString()}
                </Typography>
              </Stack>
            )}
            <Stack
              direction="row"
              alignItems="baseline"
              justifyContent="space-between"
              sx={{ mt: 2 }}
            >
              <Typography variant="h3">You pay</Typography>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 36,
                  fontWeight: 400,
                  color: 'error.main',
                  letterSpacing: -1,
                }}
              >
                ${tP.toLocaleString()}
              </Typography>
            </Stack>
            {tR > 0 && tC > 0 && (
              <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'right', color: 'success.main', mt: 0.5 }}
              >
                saving {Math.round((tC / tR) * 100)}%
              </Typography>
            )}
          </Box>
        </Paper>
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ py: 6, fontStyle: 'italic' }}
        >
          Select procedures above to see your estimate.
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          alignItems: 'stretch',
          bgcolor: 'background.paper',
        }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<SmartToyIcon />}
          onClick={() => !token && setAuthOpen(true)}
          sx={{ flex: 1 }}
        >
          {token ? 'Chat with the AI assistant →' : 'Sign up · Chat free with AI'}
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<WhatsAppIcon />}
          component="a"
          href={waHref}
          target="_blank"
          rel="noopener"
          sx={{ flex: 1, bgcolor: '#25D366', color: '#0b2b14', '&:hover': { bgcolor: '#1fc15d' } }}
        >
          Chat on WhatsApp
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<SearchIcon />}
          component={Link}
          href="/intake"
          sx={{ flex: 1 }}
        >
          Find a clinic
        </Button>
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        sx={{ display: 'block', mt: 2 }}
      >
        Estimates only. Your selections are shared with the AI assistant.
      </Typography>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} initialMode="signup" />
    </Container>
  )
}
