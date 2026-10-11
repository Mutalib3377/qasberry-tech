'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { AUDIENCES, type AudienceKey } from './audiences'

interface Props {
  courseCounts: Record<AudienceKey, number>
}

export function AudienceSection({ courseCounts }: Props) {
  const reduceMotion = useReducedMotion()

  return (
    <section id="tracks" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Two tracks
          </span>
          <h2 className="mt-5 text-3xl sm:text-[3rem] leading-[1.15] font-bold tracking-tight text-slate-950">One academy. Two audiences we know deeply.</h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            We don&apos;t try to teach everyone. We build AI learning for young learners and for the people who drive revenue.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {AUDIENCES.map((audience, index) => {
            const Icon = audience.icon
            const count = courseCounts[audience.key]

            return (
              <motion.div
                key={audience.key}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: index * 0.08 }}
              >
                <Link
                  href={audience.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.4)] hover:shadow-[0_30px_72px_-36px_rgba(15,23,42,0.42)] transition-all duration-300"
                >
                  <div className={`pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity ${audience.glow}`} />

                  <div className="relative flex items-start justify-between gap-4">
                    <span className={`h-12 w-12 rounded-2xl inline-flex items-center justify-center ${audience.iconWrap}`}>
                      <Icon size={22} />
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.12em] uppercase font-semibold text-slate-600">
                      {audience.who}
                    </span>
                  </div>

                  <h3 className="relative mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">{audience.name}</h3>
                  <p className="relative mt-3 text-sm sm:text-base leading-relaxed text-slate-600">{audience.pitch}</p>

                  <ul className="relative mt-6 grid gap-2.5 sm:grid-cols-2">
                    {audience.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check size={16} className={`mt-0.5 shrink-0 ${audience.accentText}`} />
                        {outcome}
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-auto pt-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2 text-xs font-medium">
                      <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2">
                        <p className="text-slate-500 text-[11px]">Courses</p>
                        <p className="mt-0.5 text-slate-900 font-bold">{count > 0 ? count : 'Coming soon'}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2">
                        <p className="text-slate-500 text-[11px]">Level</p>
                        <p className="mt-0.5 text-slate-900 font-bold">{audience.level}</p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${audience.accentText}`}>
                      {audience.cta}
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
