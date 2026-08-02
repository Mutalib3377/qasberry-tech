'use client'
// components/kids/kids-pathways.tsx
// Dual pathway selector — Learner card and Teacher card.
// Premium hover effects, gradient backgrounds, animated entrance.

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BookOpen, Lightbulb, Trophy, Brain, ClipboardList, FileText, MonitorPlay, PenTool } from 'lucide-react'

const LEARNER_FEATURES = [
  { icon: BookOpen,  label: 'Interactive Lessons' },
  { icon: Brain,     label: 'Fun Activities' },
  { icon: Lightbulb,label: 'Quizzes & Challenges' },
  { icon: PenTool,   label: 'Creative Projects' },
  { icon: Trophy,    label: 'Earn Certificates' },
]

const TEACHER_FEATURES = [
  { icon: ClipboardList, label: 'Lesson Plans' },
  { icon: MonitorPlay,   label: 'Presentation Slides' },
  { icon: FileText,      label: 'Printable Worksheets' },
  { icon: Brain,         label: 'Classroom Activities' },
  { icon: BookOpen,      label: 'AI Project Guides' },
]

interface PathwayCardProps {
  id: string
  badge: string
  badgeColor: string
  headline: string
  sub: string
  features: { icon: React.ElementType; label: string }[]
  ctaLabel: string
  ctaHref: string
  gradientBg: string
  gradientGlow: string
  ctaStyle: string
  emoji: string
  delay: number
}

function PathwayCard({
  id, badge, badgeColor, headline, sub, features,
  ctaLabel, ctaHref, gradientBg, gradientGlow, ctaStyle, emoji, delay,
}: PathwayCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: reduceMotion ? 0 : 0.55, delay }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
      className="group relative flex flex-col rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-[0_24px_60px_-40px_rgba(15,23,42,0.18)] hover:shadow-[0_36px_80px_-36px_rgba(15,23,42,0.28)] transition-all duration-400 cursor-pointer"
    >
      {/* Gradient top band */}
      <div className={`${gradientBg} h-2 w-full`} />

      {/* Hover glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradientGlow}`} />

      <div className="relative p-8 sm:p-10 flex flex-col flex-1">
        {/* Emoji + badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-5xl leading-none">{emoji}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeColor}`}>
            {badge}
          </span>
        </div>

        {/* Text */}
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight">
          {headline}
        </h3>
        <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
          {sub}
        </p>

        {/* Features list */}
        <ul className="mt-6 space-y-3">
          {features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white transition-colors">
                <Icon size={15} strokeWidth={1.8} />
              </span>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-8">
          <a
            href={ctaHref}
            id={id}
            className={`group/btn inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all ${ctaStyle}`}
          >
            {ctaLabel}
            <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export function KidsPathways() {
  return (
    <section id="pathways" className="py-16 sm:py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm"
          >
            Choose Your Path
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="mt-5 text-3xl sm:text-[2.8rem] font-black tracking-tight text-slate-950 leading-tight"
          >
            How do you want to use{' '}
            <span className="bg-[linear-gradient(110deg,#635bff,#38bdf8)] bg-clip-text text-transparent">
              Qasberry Kids?
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-4 text-slate-500 text-base leading-relaxed"
          >
            Whether you&apos;re a young learner ready to explore AI or an educator bringing it into the classroom — we have a dedicated experience for you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <PathwayCard
            id="kids-learner-pathway-btn"
            badge="For Learners"
            badgeColor="bg-violet-100 text-violet-700"
            headline="Start your AI adventure"
            sub="A structured, fun learning journey designed for children aged 6–16. Learn AI through short lessons, creative activities, and real projects."
            features={LEARNER_FEATURES}
            ctaLabel="Start Learning"
            ctaHref="/courses?career=kid"
            gradientBg="bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500"
            gradientGlow="bg-[radial-gradient(circle_at_12%_10%,rgba(99,91,255,0.08),transparent_50%)]"
            ctaStyle="bg-[linear-gradient(120deg,#635bff,#38bdf8)] text-white shadow-[0_10px_24px_-12px_rgba(99,91,255,0.6)] hover:shadow-[0_14px_30px_-12px_rgba(99,91,255,0.7)]"
            emoji="🚀"
            delay={0}
          />
          <PathwayCard
            id="kids-teacher-pathway-btn"
            badge="For Teachers"
            badgeColor="bg-amber-100 text-amber-700"
            headline="Bring AI into your classroom"
            sub="A complete educator toolkit with lesson plans, presentation slides, printable resources, and hands-on classroom activities — all ready to use."
            features={TEACHER_FEATURES}
            ctaLabel="Explore Resources"
            ctaHref="#teacher-resources"
            gradientBg="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
            gradientGlow="bg-[radial-gradient(circle_at_88%_12%,rgba(245,158,11,0.08),transparent_50%)]"
            ctaStyle="bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 hover:border-amber-400"
            emoji="👩‍🏫"
            delay={0.1}
          />
        </div>
      </div>
    </section>
  )
}
