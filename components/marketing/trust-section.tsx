'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react'

const TRUST_SIGNALS = [
  {
    title: 'Career-specific learning paths',
    body: 'Every experience starts from job context, not generic AI hype.',
    icon: Briefcase,
  },
  {
    title: 'Practical applied curriculum',
    body: 'Lessons are designed around real workflows professionals can use immediately.',
    icon: GraduationCap,
  },
  {
    title: 'Responsible AI foundation',
    body: 'Privacy, safety, and sound AI usage are built into the learning journey.',
    icon: ShieldCheck,
  },
  {
    title: 'Proof of progress',
    body: 'Learners move toward meaningful completion and verifiable outcomes.',
    icon: BadgeCheck,
  },
]

function TrustCard({ title, body, index, icon: Icon }: { title: string; body: string; index: number; icon: typeof Briefcase }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_44px_-34px_rgba(15,23,42,0.25)]"
    >
      <div className="h-11 w-11 rounded-2xl border border-slate-200 bg-slate-50 inline-flex items-center justify-center text-indigo-500 group-hover:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <h3 className="mt-5 text-base sm:text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </motion.div>
  )
}

export function TrustSection() {
  const logos = useMemo(() => ['HEALTH', 'LEGAL', 'FINTECH', 'EDTECH', 'OPS'], [])

  return (
    <section className="relative py-14 sm:py-16" aria-label="Trust signals">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[34px] border border-slate-200 bg-[#fafafc] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-500">Trusted learning infrastructure</p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">Built for teams and professionals moving fast into AI.</h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">From healthcare to legal and product operations, Qasberry helps professionals move from AI curiosity to measurable execution.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {logos.map((logo) => (
                <span key={logo} className="h-9 px-4 rounded-xl border border-slate-200 bg-white inline-flex items-center text-xs tracking-[0.12em] font-semibold text-slate-500">
                  {logo}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_SIGNALS.map((item, index) => (
              <TrustCard key={item.title} {...item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
