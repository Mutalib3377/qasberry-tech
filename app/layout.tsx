// app/layout.tsx — root layout, Inter only (restored)
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Qasberry — AI Learning Academy',
    template: '%s | Qasberry',
  },
  description:
    // MVP: original — 'Discover your personalised AI learning roadmap. Qasberry helps nurses, teachers, lawyers, developers and every professional master AI in their field.'
    'Fun, safe AI learning for youth. Qasberry teaches young learners how AI works through short lessons and real projects, with guides for parents and teachers.',
  keywords: ['AI learning', 'AI for youth', 'AI for kids', 'AI education', 'youth AI courses', 'Qasberry'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Qasberry',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Qasberry logo' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
