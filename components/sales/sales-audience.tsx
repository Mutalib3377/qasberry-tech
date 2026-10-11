'use client'
// components/sales/sales-audience.tsx
// "Built for people who drive revenue" — the roles this track serves.

import { motion, useReducedMotion } from 'framer-motion'
import { Briefcase, Building2, Handshake, Megaphone, PenTool, Rocket } from 'lucide-react'
import { GLASS } from './sales-ui'

const ROLES = [
  { label: 'Sales Reps & SDRs', icon: Handshake },
  { label: 'Account Executives', icon: Briefcase },
  { label: 'Marketing Managers', icon: Megaphone },
  { label: 'Content Creators', icon: PenTool },
  { label: 'Founders & Business Owners', icon: Rocket },
  { label: 'Freelancers & Agencies', icon: Building2 },
]

export function SalesAudience() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
          className={`rounded-[32px] p-6 sm:p-10 ${GLASS}`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600">Who it&apos;s for</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f1535]">
                Built for people who drive revenue.
              </h2>
            </div>
            <ul className="flex flex-wrap gap-2.5 lg:max-w-2xl lg:justify-end">
              {ROLES.map(({ label, icon: Icon }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, delay: i * 0.05 }}
                  className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[0_6px_18px_-10px_rgba(49,46,129,0.3)]"
                >
                  <Icon size={16} className="text-indigo-500" />
                  {label}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
