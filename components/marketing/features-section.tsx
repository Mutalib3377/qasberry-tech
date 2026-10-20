'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, BookOpen, Clock3, Lock, Network, Sparkles, Users2 } from 'lucide-react'

const FEATURE_CARDS = [
  {
    icon: Network,
    // MVP: original — 'A Clear Path for Each Track' / '...for kids and for sales and marketing professionals...'
    title: 'A Clear Learning Path',
    body: 'Step-by-step learning paths for young learners, so they always know what to learn next.',
    className: 'lg:col-span-2 lg:row-span-1',
  },
  {
    icon: BookOpen,
    title: 'Real Tools, Real Results',
    // MVP: original — 'Hands-on lessons with the AI tools kids love and sales teams actually use.'
    body: 'Hands-on lessons with real AI tools, made safe and simple for young learners.',
    className: 'lg:col-span-1',
  },
  {
    icon: Clock3,
    title: 'Bite-Sized Lessons',
    // MVP: original — 'Short lessons that fit after school or between sales calls.'
    body: 'Short lessons that fit after school or on a weekend.',
    className: 'lg:col-span-1',
  },
  {
    icon: Users2,
    title: 'Community',
    body: 'Share projects, prompts and wins with other learners on your track.',
    className: 'lg:col-span-1',
  },
  {
    icon: BadgeCheck,
    title: 'Verifiable Credentials',
    body: 'Earn certificates that prove real AI skills, ready for school portfolios.',
    className: 'lg:col-span-1',
  },
  {
    icon: Lock,
    title: 'Responsible AI by Design',
    // MVP: original — 'Online safety for young learners, and data privacy and ethics for professionals, built into every path.'
    body: 'Online safety, privacy and AI ethics for young learners, built into every path.',
    className: 'sm:col-span-2 lg:col-span-3',
  },
]

export function FeaturesSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Why Qasberry
          </span>
          <h2 className="mt-5 text-3xl sm:text-[3rem] leading-[1.15] tracking-tight font-bold text-slate-950">AI learning that's focused, practical and fun.</h2>
          <p className="mt-4 text-slate-600 text-base leading-relaxed">
            {/* MVP: original — "Because we teach two audiences, every course is built for the people taking it." */}
            Every course is built for young learners, and for the grown-ups helping them.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURE_CARDS.map(({ icon: Icon, title, body, className }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: reduceMotion ? 0 : 0.48, delay: index * 0.06 }}
              className={[
                'group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 sm:p-7',
                'shadow-[0_24px_60px_-42px_rgba(15,23,42,0.4)] hover:shadow-[0_30px_72px_-40px_rgba(15,23,42,0.42)] transition-all duration-300',
                className,
              ].join(' ')}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_12%_10%,rgba(111,97,255,0.12),transparent_42%),radial-gradient(circle_at_86%_86%,rgba(76,183,255,0.12),transparent_44%)]" />
              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-indigo-500 group-hover:text-blue-500 transition-colors">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
