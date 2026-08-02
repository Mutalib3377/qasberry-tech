'use client'
// components/kids/kids-why.tsx
// "Why Qasberry Kids?" — 6 premium feature cards with SVG illustrations.
// Bento-grid layout, illustrated icons, framer-motion animations.

import { motion, useReducedMotion } from 'framer-motion'

// Each card has a unique mini SVG illustration
const WHY_CARDS = [
  {
    emoji: '🎯',
    title: 'Age-Appropriate AI Education',
    desc: 'Every lesson is carefully designed for the right age group — from curious 6-year-olds to ambitious 16-year-olds — with language, concepts, and activities tailored accordingly.',
    span: 'lg:col-span-2',
    gradient: 'from-violet-500/10 to-indigo-500/10',
    border: 'hover:border-violet-300',
    accent: 'text-violet-600',
  },
  {
    emoji: '🖐️',
    title: 'Hands-On Learning',
    desc: 'Children learn best by doing. Every lesson includes activities, experiments, and projects — not just reading and watching.',
    span: 'lg:col-span-1',
    gradient: 'from-sky-500/10 to-blue-500/10',
    border: 'hover:border-sky-300',
    accent: 'text-sky-600',
  },
  {
    emoji: '👩‍🏫',
    title: 'Teacher-Designed Resources',
    desc: 'All content is created with experienced educators so it fits naturally into classroom routines and meets curriculum expectations.',
    span: 'lg:col-span-1',
    gradient: 'from-amber-400/10 to-orange-400/10',
    border: 'hover:border-amber-300',
    accent: 'text-amber-600',
  },
  {
    emoji: '🌍',
    title: 'Practical Real-World Skills',
    desc: 'We focus on AI skills children will actually use — communicating with AI tools, thinking critically about technology, and building creative projects.',
    span: 'lg:col-span-1',
    gradient: 'from-emerald-400/10 to-teal-400/10',
    border: 'hover:border-emerald-300',
    accent: 'text-emerald-600',
  },
  {
    emoji: '🛡️',
    title: 'Safe Learning Environment',
    desc: 'Child safety is built into every part of Qasberry Kids — from age-appropriate content to responsible AI lessons that teach children how to use technology wisely.',
    span: 'lg:col-span-1',
    gradient: 'from-rose-400/10 to-pink-400/10',
    border: 'hover:border-rose-300',
    accent: 'text-rose-600',
  },
  {
    emoji: '🚀',
    title: 'Future-Ready Education',
    desc: 'AI literacy is the most important skill of this generation. Qasberry Kids ensures children start building this advantage early — before it becomes essential.',
    span: 'lg:col-span-2',
    gradient: 'from-purple-500/10 to-fuchsia-500/10',
    border: 'hover:border-purple-300',
    accent: 'text-purple-600',
  },
]

export function KidsWhy() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="py-16 sm:py-24 bg-[#fafafc]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm"
          >
            Why Qasberry Kids
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="mt-5 text-3xl sm:text-[2.8rem] font-black tracking-tight text-slate-950 leading-tight"
          >
            The{' '}
            <span className="bg-[linear-gradient(110deg,#635bff,#38bdf8)] bg-clip-text text-transparent">
              smarter way
            </span>{' '}
            to teach AI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-4 text-slate-500 text-base leading-relaxed"
          >
            Qasberry Kids isn&apos;t just another online course platform. It&apos;s a thoughtfully crafted learning system built around how children actually learn best.
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_CARDS.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: i * 0.07 }}
              className={[
                'group relative rounded-[28px] border border-slate-200 bg-white p-7 overflow-hidden transition-all duration-300',
                'shadow-[0_8px_30px_-20px_rgba(15,23,42,0.15)] hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.22)]',
                card.border,
                card.span,
              ].join(' ')}
            >
              {/* Gradient hover glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-br ${card.gradient} rounded-[28px]`} />

              <div className="relative">
                {/* Large emoji illustration */}
                <motion.div
                  whileHover={reduceMotion ? undefined : { scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="text-5xl leading-none mb-5 inline-block"
                >
                  {card.emoji}
                </motion.div>

                <h3 className={`text-lg font-black tracking-tight text-slate-950 mb-3`}>
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>

                {/* Animated accent bar */}
                <div className={`mt-5 h-0.5 rounded-full bg-gradient-to-r ${card.gradient.replace('/10', '')} w-12 group-hover:w-24 transition-all duration-500 opacity-70`} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
