'use client'
// components/kids/kids-hero.tsx
// Hero section for the Qasberry Kids landing page.
// Warm, playful, premium — bright gradients, animated floating cards, dual CTA.

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

// ── Inline SVG illustration ───────────────────────────────────────────────────
function KidsIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative w-full max-w-[480px] aspect-square select-none">
      {/* Soft orb background */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.18),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(56,189,248,0.18),transparent_55%)]" />

      {/* Main illustration card */}
      <div className="absolute inset-6 rounded-[40px] border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_40px_90px_-56px_rgba(15,23,42,0.3)] overflow-hidden flex items-center justify-center">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#7c3aed 1px,transparent 1px),linear-gradient(90deg,#7c3aed 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Main SVG scene */}
        <svg viewBox="0 0 340 300" className="w-[80%] h-auto" aria-hidden>
          {/* Desk */}
          <rect x="40" y="210" width="260" height="14" rx="7" fill="#e2e8f0" />
          <rect x="70" y="224" width="12" height="40" rx="4" fill="#cbd5e1" />
          <rect x="258" y="224" width="12" height="40" rx="4" fill="#cbd5e1" />

          {/* Laptop screen */}
          <rect x="100" y="130" width="140" height="82" rx="10" fill="#1e1b4b" />
          <rect x="108" y="138" width="124" height="66" rx="6" fill="#312e81" />
          {/* Screen glow */}
          <rect x="112" y="142" width="60" height="8" rx="3" fill="#818cf8" opacity="0.8" />
          <rect x="112" y="155" width="45" height="6" rx="3" fill="#a5b4fc" opacity="0.6" />
          <rect x="112" y="166" width="52" height="6" rx="3" fill="#a5b4fc" opacity="0.5" />
          {/* AI sparkle on screen */}
          <text x="194" y="174" fontSize="20" textAnchor="middle" fill="#fbbf24">✦</text>
          {/* Laptop base */}
          <rect x="90" y="212" width="160" height="8" rx="4" fill="#475569" />

          {/* Child figure (left) */}
          {/* Head */}
          <circle cx="88" cy="145" r="22" fill="#fde68a" />
          {/* Hair */}
          <path d="M66 140 Q68 118 88 118 Q108 118 110 140" fill="#92400e" />
          {/* Eyes */}
          <circle cx="81" cy="145" r="3" fill="#1e293b" />
          <circle cx="95" cy="145" r="3" fill="#1e293b" />
          {/* Smile */}
          <path d="M81 154 Q88 160 95 154" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Body */}
          <rect x="70" y="166" width="36" height="46" rx="10" fill="#6d28d9" />
          {/* Arms */}
          <path d="M70 172 L50 188" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />
          <path d="M106 172 L126 180" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />

          {/* Teacher figure (right) */}
          {/* Head */}
          <circle cx="256" cy="138" r="24" fill="#fed7aa" />
          {/* Hair */}
          <path d="M232 132 Q234 108 256 108 Q278 108 280 132" fill="#7c2d12" />
          {/* Eyes */}
          <circle cx="249" cy="138" r="3.5" fill="#1e293b" />
          <circle cx="263" cy="138" r="3.5" fill="#1e293b" />
          {/* Smile */}
          <path d="M249 148 Q256 155 263 148" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Body */}
          <rect x="236" y="162" width="40" height="50" rx="10" fill="#0ea5e9" />
          {/* Arms */}
          <path d="M236 170 L210 190" stroke="#fed7aa" strokeWidth="11" strokeLinecap="round" />
          <path d="M276 170 L296 188" stroke="#fed7aa" strokeWidth="11" strokeLinecap="round" />

          {/* Stars/sparkles floating */}
          <text x="168" y="106" fontSize="16" fill="#f59e0b">★</text>
          <text x="60" y="108" fontSize="12" fill="#a78bfa">✦</text>
          <text x="290" y="115" fontSize="14" fill="#38bdf8">◆</text>

          {/* "AI" badge floating */}
          <rect x="148" y="70" width="44" height="24" rx="12" fill="#635bff" />
          <text x="170" y="87" fontSize="12" fontWeight="bold" textAnchor="middle" fill="white">AI ✨</text>
        </svg>
      </div>

      {/* Floating info cards */}
      {[
        { text: '🎓 Learn AI by doing', sub: 'Interactive lessons', x: '-left-4', y: 'top-12', rotate: -5 },
        { text: '🏆 Earn certificates', sub: 'Track your progress', x: '-right-6', y: 'top-24', rotate: 4 },
        { text: '👩‍🏫 Teacher resources', sub: 'Ready-made lesson plans', x: '-left-2', y: 'bottom-16', rotate: -3 },
      ].map((card, i) => (
        <motion.div
          key={card.text}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          // stagger floating offsets
          style={{
            animationDelay: `${i * 0.8}s`,
            transform: `rotate(${card.rotate}deg)`,
          }}
          className={`absolute ${card.x} ${card.y} z-20 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)]`}
        >
          <div className="text-xs font-semibold text-slate-900 leading-tight">{card.text}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{card.sub}</div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Hero component ─────────────────────────────────────────────────────────────
export function KidsHero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden pt-32 sm:pt-36 pb-20 sm:pb-28">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[5%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.14),transparent_60%)]" />
        <div className="absolute top-10 right-[-8%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.14),transparent_60%)]" />
        <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 h-[300px] w-[900px] bg-[radial-gradient(ellipse,rgba(245,158,11,0.08),transparent_65%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700"
            >
              <Sparkles size={12} className="text-amber-500" />
              Qasberry Kids
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.07 }}
              className="mt-6 text-[2.8rem] leading-[1.0] sm:text-[4rem] lg:text-[4.8rem] font-black tracking-[-0.04em] text-slate-950"
            >
              Learn AI Young.{' '}
              <span className="bg-[linear-gradient(110deg,#635bff,#38bdf8)] bg-clip-text text-transparent">
                Build the Future.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.14 }}
              className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600"
            >
              Introduce children to Artificial Intelligence through fun, interactive lessons — while giving teachers everything they need to confidently bring AI into the classroom.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.22 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <a
                href="#pathways"
                id="kids-hero-learner-cta"
                className="group inline-flex h-13 items-center gap-2.5 rounded-2xl bg-[linear-gradient(120deg,#635bff,#38bdf8)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_-14px_rgba(99,91,255,0.65)] hover:shadow-[0_16px_34px_-14px_rgba(99,91,255,0.75)] transition-all"
              >
                I&apos;m a Learner
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#teacher-resources"
                id="kids-hero-teacher-cta"
                className="group inline-flex h-13 items-center gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 px-6 py-3.5 text-sm font-bold text-amber-800 hover:bg-amber-100 hover:border-amber-400 transition-all"
              >
                I&apos;m a Teacher
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-500"
            >
              {['🎯 Age 6–16', '📚 Structured curriculum', '🏆 Earn certificates', '👩‍🏫 Teacher resources included'].map((b) => (
                <span key={b} className="flex items-center gap-1.5">{b}</span>
              ))}
            </motion.div>
          </div>

          {/* Right — illustration */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <KidsIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
