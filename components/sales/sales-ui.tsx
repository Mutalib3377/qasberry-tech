'use client'
// components/sales/sales-ui.tsx
// Shared building blocks for the Sales & Marketing landing page:
// section headers and the frosted-glass surface used across sections.

import { motion, useReducedMotion } from 'framer-motion'

/** Frosted-glass surface classes shared by cards on this page. */
export const GLASS =
  'border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_24px_60px_-36px_rgba(49,46,129,0.35),inset_0_1px_0_rgba(255,255,255,0.8)]'

/** Brand gradient used for headline accents. */
export const GRADIENT_TEXT =
  'bg-[linear-gradient(100deg,#3b82f6_0%,#5b5cf6_50%,#7c3aed_100%)] bg-clip-text text-transparent'

export function SectionHeader({
  eyebrow,
  title,
  accent,
  body,
}: {
  eyebrow: string
  title: string
  accent: string
  body?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: reduceMotion ? 0 : 0.5 }}
      className="mx-auto max-w-3xl text-center"
    >
      <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl sm:text-5xl font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0f1535]">
        {title} <span className={GRADIENT_TEXT}>{accent}</span>
      </h2>
      {body && <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">{body}</p>}
    </motion.div>
  )
}
