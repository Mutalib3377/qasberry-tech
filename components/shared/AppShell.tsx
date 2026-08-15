'use client'
// components/shared/AppShell.tsx
// Authenticated application page wrapper.
// Provides a consistent white top-bar (logo + nav slot + UserButton)
// and a page content area with the brand background color.
//
// Used by: Dashboard, Onboarding, Learn pages, etc.
// Admin pages use the Admin-specific layout instead.

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft } from 'lucide-react'

// UserButton must be lazy-loaded (ssr: false) to avoid hydration mismatch
const UserButton = dynamic(
  () => import('@clerk/nextjs').then((m) => m.UserButton),
  { ssr: false }
)

interface AppShellProps {
  children: React.ReactNode
  /** Extra items rendered in the top-bar right slot (before UserButton) */
  headerRight?: React.ReactNode
  /** Back link — renders a ← link before the logo */
  backHref?: string
  backLabel?: string
}

export function AppShell({
  children,
  headerRight,
  backHref,
  backLabel = 'Back',
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Left: optional back link + logo */}
          <div className="flex items-center gap-4">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-sm text-brand-secondary hover:text-brand-charcoal transition-colors"
              >
                <ArrowLeft size={14} />
                {backLabel}
              </Link>
            )}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Qasberry"
                width={160}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Right slot */}
          <div className="flex items-center gap-3">
            {headerRight}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main>{children}</main>
    </div>
  )
}
