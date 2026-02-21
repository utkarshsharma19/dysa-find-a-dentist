import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Maryland Dental Access Navigator',
  description: 'Find dental care in Maryland — Medicaid, uninsured, and low-cost options.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
