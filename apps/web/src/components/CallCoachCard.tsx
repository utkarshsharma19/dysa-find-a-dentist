'use client'

import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

interface CallCoachCardProps {
  title: string
  children: React.ReactNode
  copyText?: string
}

export default function CallCoachCard({ title, children, copyText }: CallCoachCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!copyText) return
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: ignore clipboard errors
    }
  }

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {copyText && (
            <Button
              size="small"
              variant="outlined"
              startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={handleCopy}
              color={copied ? 'success' : 'primary'}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}
        </Box>
        {children}
      </CardContent>
    </Card>
  )
}
