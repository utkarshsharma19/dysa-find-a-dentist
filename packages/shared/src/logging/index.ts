export const LOG_FIELDS_BLOCKLIST = [
  'phone_encrypted',
  'email_encrypted',
  'phoneEncrypted',
  'emailEncrypted',
  'password',
  'authorization',
  'cookie',
] as const

export const TRACE_HEADER = 'x-request-id' as const

export interface RequestContext {
  requestId: string
  method: string
  url: string
  userAgent?: string
  startTime: number
}
