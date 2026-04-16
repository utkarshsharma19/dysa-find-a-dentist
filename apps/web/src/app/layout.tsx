import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/lib/auth-context'
import { AssistantContextProvider } from '@/lib/chat-context'
import { GlobalChatFab } from '@/components/GlobalChatFab'

export const metadata: Metadata = {
  title: 'DYSA — Find a Dentist, Estimate Cost, Book on WhatsApp',
  description:
    'Find dental clinics, estimate your out-of-pocket cost, and book with an AI assistant over web or WhatsApp.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <AuthProvider>
              <AssistantContextProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Header />
                  <Box component="main" sx={{ flex: 1 }}>
                    {children}
                  </Box>
                  <Footer />
                </Box>
                <GlobalChatFab />
              </AssistantContextProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
