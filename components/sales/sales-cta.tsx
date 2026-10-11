'use client'
// components/sales/sales-cta.tsx
// Closing call-to-action: dark gradient panel with glass highlights.

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs'
import { ArrowRight, CircleCheck } from 'lucide-react'

export function SalesCta() {
  const reduceMotion = useReducedMotion()

  const primary =
    'group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#1e1b4b] shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)] hover:bg-indigo-50 transition-all'

  return (
    <section className="relative px-4 sm:px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#1e1b4b_0%,#312e81_45%,#4c1d95_100%)] px-6 py-14 sm:px-14 sm:py-20 text-center"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.55),transparent_65%)] blur-xl" />
          <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.5),transparent_65%)] blur-xl" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-100 backdrop-blur-md">
            Your AI edge starts here
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl sm:text-5xl font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
            Sell smarter. Market faster.{' '}
            <span className="bg-[linear-gradient(100deg,#93c5fd,#c4b5fd,#f0abfc)] bg-clip-text text-transparent">Grow with AI.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-indigo-100/80">
            Join Qasberry and start building practical AI skills for your sales and marketing work today.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <button type="button" className={primary}>
                  Get started for free
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className={primary}>
                Go to my dashboard
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </SignedIn>
            <Link
              href="#courses"
              className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/15 transition-all"
            >
              Explore courses
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-indigo-100/80">
            {['No credit card required', 'Learn at your own pace', 'Certificate on completion'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CircleCheck size={16} className="text-indigo-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  )
}
