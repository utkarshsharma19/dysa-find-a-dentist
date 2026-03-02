// Pre-hashed password for "changeme" using bcrypt (10 rounds)
// Generated with: bcrypt.hashSync('changeme', 10)
const CHANGEME_HASH = '$2b$10$mFOGqqmgNN12AqXOYmm8ueoVHuHMhMsmQJrvuYQdlDNcGpDnmKdbG'

export const adminUsersData = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@dysa.org',
    passwordHash: CHANGEME_HASH,
    displayName: 'DYSA Admin',
    role: 'ADMIN' as const,
    active: true,
  },
]
