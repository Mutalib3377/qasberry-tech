'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Briefcase, ShieldCheck, Target } from 'lucide-react'

const TRUST_SIGNALS = [
  {
    // MVP: original body — 'Every lesson is written for young learners or for revenue teams, never generic AI hype.'
    title: 'Made for young learners',
    body: 'Every lesson is written for young learners, never generic AI hype.',
    icon: Target,
  },
  {
    title: 'Learn by doing',
    // MVP: original — 'Kids build real projects, and professionals leave each lesson with a workflow they can use.'
    body: 'Learners build real projects in every lesson: chatbots, stories, games and art.',
    icon: Briefcase,
  },
  {
    title: 'Safe and responsible',
    // MVP: original — 'Age-appropriate content for kids, and privacy-first AI habits for customer data.'
    body: 'Age-appropriate content and healthy, privacy-first AI habits from day one.',
    icon: ShieldCheck,
  },
  {
    title: 'Proof of progress',
    body: 'Certificates that show parents and schools what was actually learned.',
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
  // MVP: original — ['SCHOOLS', 'PARENTS', 'SALES TEAMS', 'MARKETERS', 'FOUNDERS']
  const logos = useMemo(() => ['YOUTH', 'TEENS', 'PARENTS', 'TEACHERS', 'SCHOOLS'], [])

  return (
    <section className="relative py-14 sm:py-16" aria-label="Trust signals">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[34px] border border-slate-200 bg-[#fafafc] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-500">Who Qasberry is for</p>
              {/* MVP: original copy also covered sales & marketing teams */}
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">Focused AI learning for the next generation.</h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">Instead of courses for everyone, we go deep on young learners building future-ready skills, and on the parents and teachers who support them.</p>
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
