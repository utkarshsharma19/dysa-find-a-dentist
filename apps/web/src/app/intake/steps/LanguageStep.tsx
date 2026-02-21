'use client'

import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { useIntakeStore, updateIntake, nextStep } from '@/lib/intake-store'
import type { LanguagePreferenceType } from '@dysa/shared'

const OPTIONS: { value: LanguagePreferenceType; label: string }[] = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'SPANISH', label: 'Spanish / Espa\u00f1ol' },
  { value: 'AMHARIC', label: 'Amharic / \u12A0\u121B\u122D\u129B' },
  { value: 'FRENCH', label: 'French / Fran\u00e7ais' },
  { value: 'KOREAN', label: 'Korean / \uD55C\uAD6D\uC5B4' },
  { value: 'CHINESE', label: 'Chinese / \u4E2D\u6587' },
  { value: 'ARABIC', label: 'Arabic / \u0627\u0644\u0639\u0631\u0628\u064A\u0629' },
  { value: 'OTHER', label: 'Other' },
  { value: 'NO_PREFERENCE', label: 'No preference' },
]

export function LanguageStep() {
  const { languagePreference } = useIntakeStore()

  function select(value: LanguagePreferenceType) {
    updateIntake({ languagePreference: value })
    nextStep()
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Preferred language?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        We will try to match you with clinics that speak your language.
      </Typography>
      <List>
        {OPTIONS.map((o) => (
          <ListItemButton
            key={o.value}
            selected={languagePreference === o.value}
            onClick={() => select(o.value)}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemText primary={o.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  )
}
