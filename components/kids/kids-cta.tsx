'use client'
// components/kids/kids-cta.tsx
// Final CTA section — gradient banner with 3 action buttons and animated orbs.

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'

// Inline YouTube logo (lucide-react doesn't ship this icon in the installed version)
function YoutubeLogo({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

export function KidsCta() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: reduceMotion ? 0 : 0.6 }}
          className="relative rounded-[40px] overflow-hidden bg-[linear-gradient(135deg,#1e1b4b,#312e81,#1e3a5f)] p-10 sm:p-14 lg:p-20 text-center"
        >
          {/* Animated background orbs */}
          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -top-20 -left-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.4),transparent_65%)]"
          />
          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.35),transparent_65%)]"
          />
          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.2),transparent_65%)]"
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 mb-6">
              🚀 Start Today — It&apos;s Free to Explore
            </div>

            <h2 className="text-3xl sm:text-[2.8rem] lg:text-[3.5rem] font-black tracking-tight text-white leading-[1.08] max-w-3xl mx-auto">
              Start Your{' '}
              <span className="bg-[linear-gradient(110deg,#a78bfa,#38bdf8)] bg-clip-text text-transparent">
                AI Learning Journey
              </span>{' '}
              Today
            </h2>

            <p className="mt-6 max-w-xl mx-auto text-blue-100/80 text-base sm:text-lg leading-relaxed">
              Whether you&apos;re a child ready to discover the world of AI, a parent looking for safe and structured learning, or an educator bringing AI into your classroom — Qasberry Kids is ready for you.
            </p>

            {/* 3 CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
              <Link
                href="/courses?career=kid"
                id="kids-final-cta-start-learning"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-slate-950 shadow-[0_12px_28px_-14px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_34px_-14px_rgba(255,255,255,0.5)] hover:bg-slate-100 transition-all"
              >
                Start Learning
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href="#teacher-resources"
                id="kids-final-cta-teacher"
                className="group inline-flex items-center gap-2.5 rounded-2xl border border-white/25 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/40 transition-all"
              >
                <BookOpen size={15} />
                Explore Teacher Resources
              </a>

              <a
                href="https://www.youtube.com/results?sp=mAEB&search_query=qasberrytech"
                target="_blank"
                rel="noopener noreferrer"
                id="kids-final-cta-youtube"
                className="group inline-flex items-center gap-2.5 rounded-2xl border border-red-400/30 bg-red-600/20 px-7 py-4 text-sm font-bold text-red-200 backdrop-blur-sm hover:bg-red-600/30 hover:border-red-400/50 transition-all"
              >
                <YoutubeLogo size={15} />
                Watch Free Lessons on YouTube
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-200/60">
              <span>🎯 Trusted by schools</span>
              <span>🏆 Certificates included</span>
              <span>🛡️ Safe for children</span>
              <span>📚 Teacher-designed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
