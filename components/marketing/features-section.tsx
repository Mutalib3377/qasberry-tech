'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, BookOpen, Clock3, Lock, Network, Sparkles, Users2 } from 'lucide-react'

const FEATURE_CARDS = [
  {
    icon: Network,
    title: 'Adaptive AI Roadmaps',
    body: 'Roadmaps adapt to your role, goals, and available time so each week feels focused.',
    className: 'lg:col-span-2 lg:row-span-1',
  },
  {
    icon: BookOpen,
    title: 'Career-Calibrated Curriculum',
    body: 'Every course is scoped around practical tools used in your profession.',
    className: 'lg:col-span-1',
  },
  {
    icon: Clock3,
    title: 'Momentum-Friendly Pace',
    body: 'Short lessons and applied exercises designed for crowded calendars.',
    className: 'lg:col-span-1',
  },
  {
    icon: Users2,
    title: 'Peer Intelligence Layer',
    body: 'Join communities where professionals compare workflows, prompts, and outcomes.',
    className: 'lg:col-span-1',
  },
  {
    icon: BadgeCheck,
    title: 'Verifiable Credentials',
    body: 'Earn trusted certificates that demonstrate real AI capability, not only course attendance.',
    className: 'lg:col-span-1',
  },
  {
    icon: Lock,
    title: 'Responsible AI by Design',
    body: 'Ethics, privacy, and risk governance are embedded into each learning path.',
    className: 'lg:col-span-2',
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
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            <Sparkles size={14} className="text-indigo-500" />
            Why Qasberry
          </span>
          <h2 className="mt-5 text-3xl sm:text-[3rem] tracking-tight font-bold text-slate-950">A premium system for career-first AI learning.</h2>
          <p className="mt-4 text-slate-600 text-base leading-relaxed">
            Built from first principles for professionals who need quality, speed, and structure when adopting AI.
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
