'use client'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

interface Props {
  courseCount: number
}

export function CtaBanner({ courseCount }: Props) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="pricing" className="py-16 sm:py-20 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white p-8 sm:p-12 lg:p-14"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 left-[-8%] h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(113,106,255,0.26),transparent_68%)]" />
            <div className="absolute bottom-[-80px] right-[-6%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(79,187,255,0.24),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.92),rgba(250,250,252,0.75))]" />
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm">
              <Sparkles size={13} className="text-indigo-500" />
              {courseCount > 0 ? `${courseCount} course${courseCount !== 1 ? 's' : ''} available now` : 'Launching soon'}
            </div>

            <h2 className="mt-6 text-3xl sm:text-5xl font-black tracking-[-0.03em] text-slate-950">
              Build your AI edge with clarity,
              <br className="hidden sm:block" />
              confidence, and momentum.
            </h2>

            <p className="mt-5 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Join Qasberry and receive a personalized roadmap in minutes. Designed for professionals who want results, not generic tutorials.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    id="cta-get-started-btn"
                    className="group inline-flex h-12 sm:h-13 items-center gap-2.5 px-6 sm:px-7 rounded-2xl bg-[linear-gradient(120deg,#5b5ff7,#4f87ff,#3aa7fb)] text-white text-sm sm:text-base font-semibold shadow-[0_18px_34px_-20px_rgba(79,135,255,0.72)] hover:shadow-[0_22px_40px_-20px_rgba(79,135,255,0.82)] transition-all"
                  >
                    Get started for free
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/onboarding"
                  id="cta-roadmap-btn"
                  className="group inline-flex h-12 sm:h-13 items-center gap-2.5 px-6 sm:px-7 rounded-2xl bg-[linear-gradient(120deg,#5b5ff7,#4f87ff,#3aa7fb)] text-white text-sm sm:text-base font-semibold shadow-[0_18px_34px_-20px_rgba(79,135,255,0.72)] hover:shadow-[0_22px_40px_-20px_rgba(79,135,255,0.82)] transition-all"
                >
                  Build my roadmap
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </SignedIn>
            </div>

            <p className="mt-5 text-slate-500 text-sm">No credit card required. Begin with your career context.</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
