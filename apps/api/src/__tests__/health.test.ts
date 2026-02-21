import { describe, it, expect, afterAll } from 'vitest'
import { buildApp } from '../app.js'

describe('GET /health', () => {
  const app = buildApp()

  afterAll(async () => {
    await app.close()
  })

  it('returns 200 with status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)

    const body = JSON.parse(res.payload)
    expect(body.status).toBe('ok')
    expect(body.name).toBe('Maryland Dental Access Navigator')
    expect(body.version).toBeDefined()
    expect(body.timestamp).toBeDefined()
  })
})
