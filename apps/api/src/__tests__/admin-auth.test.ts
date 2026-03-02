import { describe, it, expect, afterAll, vi } from 'vitest'
import { buildApp } from '../app.js'
import { signAdminToken } from '../plugins/admin-auth.js'

// Mock the database module
vi.mock('../db.js', () => {
  const bcrypt = require('bcrypt')
  const hash = bcrypt.hashSync('testpass', 10)

  const mockUser = {
    id: 'test-admin-id',
    email: 'admin@test.com',
    passwordHash: hash,
    displayName: 'Test Admin',
    role: 'ADMIN',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([mockUser]),
  }

  return {
    getDb: () => mockDb,
    _mockDb: mockDb,
    _mockUser: mockUser,
  }
})

describe('Admin Auth', () => {
  const app = buildApp()

  afterAll(async () => {
    await app.close()
  })

  describe('POST /admin/auth/login', () => {
    it('returns 400 when email or password missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/auth/login',
        payload: { email: 'admin@test.com' },
      })
      expect(res.statusCode).toBe(400)
    })

    it('returns token on valid login', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/auth/login',
        payload: { email: 'admin@test.com', password: 'testpass' },
      })
      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.payload)
      expect(body.token).toBeDefined()
      expect(body.user.email).toBe('admin@test.com')
      expect(body.user.role).toBe('ADMIN')
    })

    it('returns 401 on wrong password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/admin/auth/login',
        payload: { email: 'admin@test.com', password: 'wrongpass' },
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /admin/auth/me', () => {
    it('returns 401 without token', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/auth/me',
      })
      expect(res.statusCode).toBe(401)
    })

    it('returns 401 with invalid token', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/auth/me',
        headers: { authorization: 'Bearer invalid-token' },
      })
      expect(res.statusCode).toBe(401)
    })

    it('returns user info with valid token', async () => {
      const token = signAdminToken({
        sub: 'test-admin-id',
        email: 'admin@test.com',
        role: 'ADMIN',
      })

      const res = await app.inject({
        method: 'GET',
        url: '/admin/auth/me',
        headers: { authorization: `Bearer ${token}` },
      })
      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.payload)
      expect(body.user.email).toBe('admin@test.com')
    })
  })

  describe('Role guards', () => {
    it('signAdminToken creates valid JWT', () => {
      const token = signAdminToken({
        sub: 'test-id',
        email: 'test@test.com',
        role: 'VIEWER',
      })
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })
  })
})
