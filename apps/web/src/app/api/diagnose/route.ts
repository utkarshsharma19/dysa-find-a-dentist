import { NextResponse, type NextRequest } from 'next/server'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }

  const upstream = new FormData()
  upstream.append('file', file, file.name)

  const res = await fetch(`${ML_SERVICE_URL}/predict`, {
    method: 'POST',
    body: upstream,
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => 'inference failed')
    return NextResponse.json({ error: msg || `HTTP ${res.status}` }, { status: res.status })
  }

  return NextResponse.json(await res.json())
}
