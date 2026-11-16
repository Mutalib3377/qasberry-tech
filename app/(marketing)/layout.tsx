// app/(marketing)/layout.tsx
// Layout for all public marketing pages.
// No auth required — passes through freely per middleware config.
// Loads the display + mono fonts used by the robotics-themed homepage;
// exposed as CSS variables so Tailwind's font-display / font-hud work.

import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jbmono',
  display: 'swap',
  weight: ['400', '500', '600'],
})

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${grotesk.variable} ${jetbrainsMono.variable} contents`}>
      {children}
    </div>
  )
}
