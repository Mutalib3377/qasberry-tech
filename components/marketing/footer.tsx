'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { LinkedInIcon, XIcon } from '@/components/shared/brand-icons'
import { SOCIAL_PROFILES } from '@/lib/site'
import { VISIBLE_AUDIENCES } from './audiences'
import { SHOW_COMMUNITY } from '@/lib/features'

// ── Link columns config ───────────────────────────────────────────────────────

const PLATFORM_LINKS = [
  { label: 'Why Qasberry', href: '/#features' },
  { label: 'Our Tracks',   href: '/#tracks' },
  { label: 'How It Works', href: '/#how' },
  ...(SHOW_COMMUNITY ? [{ label: 'Community', href: '/community' }] : []),
]

const LEARN_LINKS = [
  { label: 'Browse Courses', href: '/courses' },
  { label: 'My Dashboard',   href: '/dashboard' },
  // ?tab= opens the Certificates tab once the dashboard has tabs; the hash
  // scrolls to the certificates section until then
  { label: 'Certificates',   href: '/dashboard?tab=certificates#certificates' },
]

const RESOURCE_LINKS = [
  { label: 'Help Center', href: '/help' },
  ...VISIBLE_AUDIENCES.map((a) => ({ label: a.name, href: a.href })),
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms' },
  { label: 'Cookie Policy',  href: '/cookies' },
]

// Profiles without a URL in lib/site.ts are left out
const SOCIAL_LINKS = [
  { label: 'Qasberry on X',        href: SOCIAL_PROFILES.x,        icon: XIcon },
  { label: 'Qasberry on LinkedIn', href: SOCIAL_PROFILES.linkedin, icon: LinkedInIcon },
].filter((link) => link.href)

type FooterTheme = 'light' | 'robotics'

const THEME = {
  light: {
    footer: 'border-t border-slate-200 bg-white',
    panel: 'rounded-[32px] border border-slate-200 bg-[#fafafc]',
    logo: '',
    tagline: 'text-slate-600',
    social: 'border-slate-200 bg-white hover:border-slate-300 hover:text-slate-900 text-slate-500',
    newsletterCard: 'rounded-2xl border border-slate-200 bg-white',
    newsletterTitle: 'text-slate-900',
    newsletterSub: 'text-slate-500',
    input:
      'h-10 w-full rounded-xl border bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 px-3 text-sm outline-none focus:border-indigo-300',
    colTitle: 'text-slate-500',
    link: 'text-slate-600 hover:text-slate-950',
    legal: 'text-slate-500 hover:text-slate-800',
    bottomBorder: 'border-slate-200',
    copyright: 'text-slate-500',
    motto: 'text-slate-400',
    subscribed: 'text-emerald-600',
  },
  // Robotics homepage: rx-* tokens, adapts to light and dark
  robotics: {
    footer: 'border-t border-rx-line rx-bg',
    panel: 'rounded-[32px] rx-panel',
    logo: 'rx-logo',
    tagline: 'text-rx-muted',
    social: 'border-rx-line-strong bg-rx-chip hover:border-rx-line-hover hover:text-rx-cyan-ink text-rx-muted',
    newsletterCard: 'rounded-2xl border border-rx-line bg-rx-chip',
    newsletterTitle: 'text-rx-text',
    newsletterSub: 'text-rx-dim',
    input:
      'h-10 w-full rounded-xl border bg-[var(--rx-input-bg)] border-rx-line-strong text-rx-text placeholder:text-rx-dim px-3 text-sm outline-none focus:border-rx-line-hover',
    colTitle: 'text-rx-dim',
    link: 'text-rx-muted hover:text-rx-text',
    legal: 'text-rx-dim hover:text-rx-text-2',
    bottomBorder: 'border-rx-line',
    copyright: 'text-rx-dim',
    motto: 'text-rx-faint',
    subscribed: 'text-rx-cyan-ink',
  },
} as const

// ── Component ─────────────────────────────────────────────────────────────────

export function Footer({ theme = 'light' }: { theme?: FooterTheme }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const t = THEME[theme]

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) {
      // No newsletter backend yet — show confirmation, store nothing sensitive
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <footer className={`pt-10 sm:pt-14 pb-8 ${t.footer}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`p-6 sm:p-8 lg:p-10 ${t.panel}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="space-y-5 lg:col-span-2">
              <Link href="/" className="flex items-center w-fit">
                <Image
                  src="/logo.png"
                  alt="Qasberrytech logo"
                  width={170}
                  height={42}
                  className={`h-9 w-auto ${t.logo}`}
                />
              </Link>

              <p className={`text-sm leading-relaxed max-w-sm ${t.tagline}`}>
                The AI academy for youth.
              </p>

              {SOCIAL_LINKS.length > 0 && (
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${t.social}`}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
              )}

              <div className={`p-4 ${t.newsletterCard}`}>
                <h4 className={`text-sm font-semibold ${t.newsletterTitle}`}>Stay in the loop</h4>
                <p className={`mt-1 text-xs ${t.newsletterSub}`}>
                  Get new course releases and practical AI playbooks weekly.
                </p>

                {submitted ? (
                  <div className={`mt-3 text-sm font-medium ${t.subscribed}`}>You are subscribed.</div>
                ) : (
                  <form onSubmit={handleNewsletter} className="mt-3 flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={t.input}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-10 px-4 rounded-xl bg-[linear-gradient(120deg,#5b5ff7,#4f87ff,#3aa7fb)] border-0 hover:opacity-95"
                    >
                      Join
                      <ArrowRight size={14} />
                    </Button>
                  </form>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className={`text-xs font-semibold uppercase tracking-widest ${t.colTitle}`}>Platform</h4>
              <ul className="space-y-2.5">
                {PLATFORM_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={`text-sm transition-colors ${t.link}`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className={`text-xs font-semibold uppercase tracking-widest ${t.colTitle}`}>Learn</h4>
              <ul className="space-y-2.5">
                {LEARN_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={`text-sm transition-colors ${t.link}`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className={`text-xs font-semibold uppercase tracking-widest ${t.colTitle}`}>Resources</h4>
              <ul className="space-y-2.5">
                {RESOURCE_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className={`text-sm transition-colors ${t.link}`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-2 space-y-2">
                {LEGAL_LINKS.map(({ label, href }) => (
                  <div key={label}>
                    <Link href={href} className={`text-xs transition-colors ${t.legal}`}>
                      {label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mt-6 border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 ${t.bottomBorder}`}
        >
          <p className={`text-xs ${t.copyright}`}>
            © {new Date().getFullYear()} Qasberry. All rights reserved.
          </p>
          <p className={`text-xs ${t.motto}`}>Built for young learners and the people who guide them.</p>
        </div>
      </div>
    </footer>
  )
}
