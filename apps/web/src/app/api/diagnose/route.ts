import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_ML_SERVICE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://utkarshsharma19-dysa-dental-screening.hf.space'
    : 'http://localhost:8000'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? DEFAULT_ML_SERVICE_URL

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'multipart form data is required' }, { status: 400 })
  }

  const file = formData.get('file')

  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }

  const upstream = new FormData()
  upstream.append('file', file, file.name || 'upload')

  let res: Response
  try {
    res = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      body: upstream,
    })
  } catch {
    return NextResponse.json({ error: 'inference service unavailable' }, { status: 502 })
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => 'inference failed')
    return NextResponse.json({ error: msg || `HTTP ${res.status}` }, { status: res.status })
  }

  return NextResponse.json(await res.json())
}
