'use client'
// components/kids/kids-journey.tsx
// Animated learning roadmap showing the 7-step journey.
// Steps animate in on scroll; connecting lines use framer-motion SVG path drawing.

import { motion, useReducedMotion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Compass, BookOpen, Zap, HelpCircle, FolderOpen, Award, Unlock } from 'lucide-react'

const STEPS = [
  {
    icon:  Compass,
    emoji: '🔭',
    title: 'Discover AI',
    desc:  'Find out what AI really is and how it\'s already part of your world.',
    color: 'from-violet-500 to-indigo-500',
    bg:    'bg-violet-50 border-violet-200',
    iconColor: 'text-violet-600',
  },
  {
    icon:  BookOpen,
    emoji: '📖',
    title: 'Short Lessons',
    desc:  'Learn through bite-sized, engaging lessons designed for young minds.',
    color: 'from-sky-500 to-blue-500',
    bg:    'bg-sky-50 border-sky-200',
    iconColor: 'text-sky-600',
  },
  {
    icon:  Zap,
    emoji: '⚡',
    title: 'Fun Activities',
    desc:  'Practise new skills through hands-on AI experiments and games.',
    color: 'from-amber-400 to-orange-500',
    bg:    'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
  },
  {
    icon:  HelpCircle,
    emoji: '🧠',
    title: 'Take Quizzes',
    desc:  'Test your knowledge with fun quizzes to reinforce what you\'ve learned.',
    color: 'from-emerald-400 to-teal-500',
    bg:    'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  {
    icon:  FolderOpen,
    emoji: '🎨',
    title: 'Build Projects',
    desc:  'Apply your skills by creating real AI-powered projects.',
    color: 'from-rose-400 to-pink-500',
    bg:    'bg-rose-50 border-rose-200',
    iconColor: 'text-rose-600',
  },
  {
    icon:  Award,
    emoji: '🏆',
    title: 'Earn Certificates',
    desc:  'Get a Qasberry Kids certificate to celebrate your achievement.',
    color: 'from-purple-500 to-violet-500',
    bg:    'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    icon:  Unlock,
    emoji: '🚀',
    title: 'Unlock Next Level',
    desc:  'Advance to harder challenges and unlock new learning tracks.',
    color: 'from-indigo-500 to-blue-600',
    bg:    'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-600',
  },
]

export function KidsJourney() {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

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
            Learning Journey
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="mt-5 text-3xl sm:text-[2.8rem] font-black tracking-tight text-slate-950 leading-tight"
          >
            From{' '}
            <span className="bg-[linear-gradient(110deg,#635bff,#38bdf8)] bg-clip-text text-transparent">
              curious beginner
            </span>{' '}
            to AI creator
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-4 text-slate-500 text-base leading-relaxed"
          >
            Every child follows a clear, structured path. Here&apos;s exactly how the journey unfolds.
          </motion.p>
        </div>

        {/* Steps — alternating left/right on desktop, straight vertical on mobile */}
        <div ref={ref} className="relative max-w-4xl mx-auto">
          {/* Vertical connecting line (desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block overflow-hidden">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: reduceMotion ? 0 : 2.5, ease: 'easeInOut' }}
              style={{ originY: 0 }}
              className="w-full h-full bg-gradient-to-b from-violet-300 via-sky-300 to-emerald-300"
            />
          </div>

          <div className="space-y-8 md:space-y-0">
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0
              const Icon = step.icon

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30, y: 10 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: reduceMotion ? 0 : 0.55, delay: i * 0.08 }}
                  className={`relative md:flex md:items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} md:gap-8`}
                >
                  {/* Card */}
                  <div className={`flex-1 ${isLeft ? 'md:text-right md:pr-10' : 'md:pl-10'}`}>
                    <div
                      className={`inline-flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'} items-start gap-3 p-6 rounded-[24px] border ${step.bg} max-w-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{step.emoji}</span>
                        <span className={`text-lg font-black text-slate-950`}>{step.title}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed text-left">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center node */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                    <div className={`relative h-12 w-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-[0_6px_20px_-8px_rgba(99,91,255,0.5)] z-10`}>
                      <Icon size={20} className="text-white" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Mobile left icon */}
                  <div className="md:hidden flex items-center gap-3 mb-2 mt-4">
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step {i + 1}</span>
                  </div>

                  {/* Empty right side spacer */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
