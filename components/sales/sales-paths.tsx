'use client'
// components/sales/sales-paths.tsx
// Three learning paths: AI for Sales, AI for Marketing, AI Growth Systems.

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ChartNoAxesCombined, Handshake, Megaphone } from 'lucide-react'
import { GLASS, SectionHeader } from './sales-ui'

const PATHS = [
  {
    title: 'AI for Sales',
    level: 'Beginner',
    body: 'Prospect smarter, personalise outreach and keep your pipeline moving.',
    icon: Handshake,
    iconBg: 'bg-[linear-gradient(135deg,#6366f1,#3b82f6)]',
    modules: [
      'Prospect research with AI',
      'Personalised outreach at scale',
      'Call prep & objection handling',
      'Follow-ups & pipeline hygiene',
    ],
    featured: false,
  },
  {
    title: 'AI for Marketing',
    level: 'Beginner – Intermediate',
    body: 'Plan, create and launch campaigns faster, without losing your brand voice.',
    icon: Megaphone,
    iconBg: 'bg-[linear-gradient(135deg,#8b5cf6,#6366f1)]',
    modules: [
      'Content & copywriting with AI',
      'Campaign planning & automation',
      'SEO and social media workflows',
      'Creative assets with AI tools',
    ],
    featured: true,
  },
  {
    title: 'AI Growth Systems',
    level: 'Intermediate – Advanced',
    body: 'Connect your tools and data so AI works across your whole funnel.',
    icon: ChartNoAxesCombined,
    iconBg: 'bg-[linear-gradient(135deg,#0ea5e9,#6366f1)]',
    modules: [
      'CRM & data integration',
      'Marketing analytics & reporting',
      'No-code workflow automation',
      'AI assistants for your team',
    ],
    featured: false,
  },
]

export function SalesPaths() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="paths" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Learning paths"
          title="Find the path that fits"
          accent="your role."
          body="Start where you are. Each path takes you from the basics to workflows you can use at work the same day."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PATHS.map((path, i) => {
            const Icon = path.icon
            return (
              <motion.article
                key={path.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: i * 0.08 }}
                whileHover={reduceMotion ? undefined : { y: -6 }}
                className={[
                  'relative flex flex-col rounded-[30px] p-7',
                  path.featured
                    ? 'bg-[linear-gradient(160deg,rgba(255,255,255,0.85),rgba(238,242,255,0.75))] backdrop-blur-xl border border-indigo-200 shadow-[0_30px_70px_-34px_rgba(79,70,229,0.55)] lg:-translate-y-3'
                    : GLASS,
                ].join(' ')}
              >
                {path.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-[linear-gradient(90deg,#f472b6,#c084fc)] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                    Most popular
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_10px_24px_-10px_rgba(79,70,229,0.7)] ${path.iconBg}`}>
                    <Icon size={22} />
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {path.level}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-tight text-[#0f1535]">{path.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{path.body}</p>

                <ul className="mt-6 space-y-3 border-t border-slate-200/70 pt-6">
                  {path.modules.map((module) => (
                    <li key={module} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {module}
                    </li>
                  ))}
                </ul>

                <Link
                  href="#courses"
                  className={[
                    'group mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all',
                    path.featured
                      ? 'bg-[linear-gradient(120deg,#5b5cf6,#4f46e5)] text-white shadow-[0_12px_26px_-12px_rgba(79,70,229,0.7)]'
                      : 'border border-slate-200 bg-white/80 text-[#0f1535] hover:border-indigo-200 hover:bg-white',
                  ].join(' ')}
                >
                  View courses
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
