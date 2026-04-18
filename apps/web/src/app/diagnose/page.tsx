'use client'

import { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import BiotechIcon from '@mui/icons-material/Biotech'
import Link from 'next/link'

interface Detection {
  class_id: number
  label: string
  confidence: number
  bbox: [number, number, number, number]
}

interface PredictResponse {
  image: { width: number; height: number }
  predicted_condition: string | null
  detections: Detection[]
}

const MAX_UPLOAD_IMAGE_SIDE = 1280
const MAX_DIRECT_UPLOAD_BYTES = 2 * 1024 * 1024
const ANALYZE_TIMEOUT_MS = 70_000

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Use a JPEG, PNG, or WebP image.'))
    }
    img.src = url
  })

const prepareImageForUpload = async (source: File) => {
  if (!source.type.startsWith('image/')) {
    throw new Error('Choose an image file.')
  }

  const img = await loadImageFromFile(source)
  const maxSide = Math.max(img.naturalWidth, img.naturalHeight)

  if (!maxSide) {
    throw new Error('Could not read that image.')
  }

  const scale = Math.min(1, MAX_UPLOAD_IMAGE_SIDE / maxSide)
  if (scale === 1 && source.size <= MAX_DIRECT_UPLOAD_BYTES) {
    return source
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not prepare that image.')
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) resolve(value)
        else reject(new Error('Could not prepare that image.'))
      },
      'image/jpeg',
      0.85,
    )
  })

  const name = source.name.replace(/\.[^.]+$/, '') || 'upload'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}

export default function DiagnosePage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const onFile = (f: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f)
    setPreviewUrl(f ? URL.createObjectURL(f) : null)
    setResult(null)
    setError(null)
  }

  const onPredict = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS)

    try {
      const uploadFile = await prepareImageForUpload(file)
      const fd = new FormData()
      fd.append('file', uploadFile)
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: fd,
        signal: controller.signal,
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(j.error ?? 'Request failed')
      }
      setResult((await res.json()) as PredictResponse)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        setError('Analysis is taking too long. Try again in a minute or upload a smaller JPEG.')
      } else {
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    } finally {
      window.clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !result) return

    const draw = () => {
      canvas.width = img.clientWidth
      canvas.height = img.clientHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const sx = canvas.width / result.image.width
      const sy = canvas.height / result.image.height

      ctx.lineWidth = 2
      ctx.font = '14px system-ui, sans-serif'

      for (const d of result.detections) {
        const [x1, y1, x2, y2] = d.bbox
        const x = x1 * sx
        const y = y1 * sy
        const w = (x2 - x1) * sx
        const h = (y2 - y1) * sy

        ctx.strokeStyle = '#ff3366'
        ctx.strokeRect(x, y, w, h)

        const label = `${d.label} ${(d.confidence * 100).toFixed(0)}%`
        const tw = ctx.measureText(label).width + 8
        ctx.fillStyle = '#ff3366'
        ctx.fillRect(x, Math.max(0, y - 18), tw, 18)
        ctx.fillStyle = '#fff'
        ctx.fillText(label, x + 4, Math.max(12, y - 4))
      }
    }

    if (img.complete) draw()
    else img.onload = draw

    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [result])

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'primary.main', mb: 1 }}>
        <BiotechIcon />
        <Typography variant="overline">AI dental screening (beta)</Typography>
      </Stack>
      <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, mb: 1 }}>
        Upload an intraoral photo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Our model highlights potential regions of concern in your dental photo. This is a screening
        aid, not a diagnosis — always confirm with a licensed dentist.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            {file ? 'Replace image' : 'Choose image'}
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </Button>

          {previewUrl && (
            <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <img
                ref={imgRef}
                src={previewUrl}
                alt="Upload preview"
                style={{ maxWidth: '100%', display: 'block', borderRadius: 8 }}
              />
              <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            disabled={!file || loading}
            onClick={onPredict}
            sx={{ alignSelf: 'flex-start' }}
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </Button>

          {loading && (
            <Box>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Preparing the photo and checking it with the model. First runs can take up to a
                minute.
              </Typography>
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}

          {result && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {result.detections.length === 0
                  ? 'No model finding above the confidence threshold.'
                  : `${result.detections.length} region${result.detections.length > 1 ? 's' : ''} detected`}
                {result.predicted_condition && ` — top: ${result.predicted_condition}`}
              </Typography>
              {result.detections.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This does not rule out a dental problem. The model only screens for visible caries
                  in clear close-up photos and can miss real issues.
                </Alert>
              )}
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {result.detections.map((d, i) => (
                  <Chip
                    key={i}
                    label={`${d.label} · ${(d.confidence * 100).toFixed(0)}%`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>

      <Alert severity="warning" sx={{ mt: 3 }}>
        This tool does not replace a dental exam. If you have pain, bleeding, swelling, or trauma,
        see a dentist — use our <Link href="/emergency">emergency guide</Link> if urgent.
      </Alert>
    </Container>
  )
}
