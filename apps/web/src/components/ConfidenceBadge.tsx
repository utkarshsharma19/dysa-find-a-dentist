'use client'

import Chip from '@mui/material/Chip'

const CONFIDENCE_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  HIGH: 'success',
  MEDIUM: 'warning',
  LOW: 'default',
}

const CONFIDENCE_LABELS: Record<string, string> = {
  HIGH: 'High confidence',
  MEDIUM: 'Moderate confidence',
  LOW: 'Limited data',
}

interface ConfidenceBadgeProps {
  confidence: string | null
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const level = confidence ?? 'LOW'
  return (
    <Chip
      label={CONFIDENCE_LABELS[level] ?? 'Unknown'}
      color={CONFIDENCE_COLORS[level] ?? 'default'}
      size="small"
      variant="outlined"
    />
  )
}
