'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight, Globe, Send, AtSign } from 'lucide-react'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { motion } from 'framer-motion'

// ── Link columns config ───────────────────────────────────────────────────────

const PLATFORM_LINKS = [
  { label: 'Features',     href: '/#features' },
  { label: 'Careers',      href: '/#careers' },
  { label: 'How It Works', href: '/#how' },
  { label: 'Roadmap',      href: '/onboarding' },
  { label: 'Community',    href: '/community' },
]

const LEARN_LINKS = [
  { label: 'Browse Courses', href: '/courses' },
  { label: 'My Dashboard',   href: '/dashboard' },
  { label: 'My Roadmap',     href: '/onboarding' },
  { label: 'Certificates',   href: '/dashboard' },
]

const RESOURCE_LINKS = [
  { label: 'Help Center', href: '/courses' },
  { label: 'Career Paths', href: '/#careers' },
  { label: 'Case Studies', href: '/community' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms' },
  { label: 'Cookie Policy',  href: '/cookies' },
]

const SOCIAL_LINKS = [
  { label: 'Twitter',  href: 'https://twitter.com', icon: Send },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: AtSign },
  { label: 'Website',  href: 'https://qasberry.com', icon: Globe },
]


// ── Component ─────────────────────────────────────────────────────────────────

export function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) {
      // No newsletter backend yet — show confirmation, store nothing sensitive
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <footer className="pt-10 sm:pt-14 pb-8 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-[32px] border border-slate-200 bg-[#fafafc] p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="space-y-5 lg:col-span-2">
            <Link href="/" className="flex items-center w-fit">
              <Image
                src="/logo.png"
                alt="Qasberrytech logo"
                width={170}
                height={42}
                className="h-9 w-auto"
              />
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              The premium AI learning academy for ambitious professionals who want practical outcomes.
            </p>

            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:text-slate-900 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <h4 className="text-sm font-semibold text-slate-900">Stay in the loop</h4>
              <p className="mt-1 text-xs text-slate-500">Get new course releases and practical AI playbooks weekly.</p>

              {submitted ? (
                <div className="mt-3 text-emerald-600 text-sm font-medium">You are subscribed.</div>
              ) : (
                <form onSubmit={handleNewsletter} className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  />
                  <Button type="submit" size="sm" className="h-10 px-4 rounded-xl bg-[linear-gradient(120deg,#5b5ff7,#4f87ff,#3aa7fb)] border-0 hover:opacity-95">
                    Join
                    <ArrowRight size={14} />
                  </Button>
                </form>
              )}
            </motion.div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-600 hover:text-slate-950 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Learn
            </h4>
            <ul className="space-y-2.5">
              {LEARN_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-slate-600 hover:text-slate-950 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

            <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Resources</h4>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-slate-600 hover:text-slate-950 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-2 space-y-2">
              {LEGAL_LINKS.map(({ label, href }) => (
                <div key={label}>
                  <Link
                    href={href}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Qasberry. All rights reserved.</p>
          <p className="text-xs text-slate-400">Designed for the next generation of AI-first professionals.</p>
        </div>
          </div>
    </footer>
  )
}
