'use client'
// components/shared/AppShell.tsx
// Authenticated application page wrapper.
// Provides a consistent white top-bar (logo + app nav + nav slot + user menu)
// and a page content area with the brand background color.
//
// Used by: Dashboard, Onboarding, Learn pages, etc.
// Admin pages use the Admin-specific layout instead.

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { ArrowLeft, BookOpen, LayoutDashboard, Users } from 'lucide-react'

// UserMenu wraps Clerk's UserButton, which must be lazy-loaded (ssr: false)
// to avoid a hydration mismatch
const UserMenu = dynamic(
  () => import('@/components/shared/user-menu').then((m) => m.UserMenu),
  { ssr: false }
)

// Main signed-in destinations, shown in the top bar on every app page
const APP_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Courses',   href: '/courses',   icon: BookOpen },
  { label: 'Community', href: '/community', icon: Users },
]

interface AppShellProps {
  children: React.ReactNode
  /** Extra items rendered in the top-bar right slot (before the user menu) */
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
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: optional back link + logo */}
          <div className="flex items-center gap-4 min-w-0">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-sm text-brand-secondary hover:text-brand-charcoal transition-colors"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
            )}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Qasberry"
                width={160}
                height={40}
                className="h-7 sm:h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Centre: app navigation (icons only on small screens) */}
          <nav className="flex items-center gap-1" aria-label="App navigation">
            {APP_NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-brand-purple-soft text-brand-purple'
                      : 'text-brand-secondary hover:text-brand-charcoal hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right slot */}
          <div className="flex items-center gap-3">
            {headerRight}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main>{children}</main>
    </div>
  )
}
