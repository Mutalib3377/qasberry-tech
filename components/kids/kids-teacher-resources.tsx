'use client'
// components/kids/kids-teacher-resources.tsx
// Teacher resource preview grid section.

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, FileText, MonitorPlay, BookOpen, Layers, ClipboardCheck, Video, Lightbulb, Users } from 'lucide-react'

const RESOURCES = [
  { icon: ClipboardCheck, emoji: '📋', title: 'Lesson Plans', desc: 'Complete, ready-to-teach lesson plans aligned to your curriculum.', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { icon: MonitorPlay, emoji: '🖥️', title: 'Presentation Slides', desc: 'Beautiful classroom-ready slide decks for every lesson topic.', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
  { icon: FileText, emoji: '📄', title: 'Printable Worksheets', desc: 'Student worksheets designed for hands-on classroom activities.', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { icon: Layers, emoji: '🧩', title: 'Classroom Activities', desc: 'Group and individual AI activities that make learning stick.', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { icon: BookOpen, emoji: '📚', title: 'Teaching Guides', desc: 'Step-by-step guides to support you as a first-time AI educator.', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { icon: Lightbulb, emoji: '💡', title: 'Project Guides', desc: 'Structured project briefs for creative AI student challenges.', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { icon: Video, emoji: '🎥', title: 'Teaching Videos', desc: 'Short explainer videos to play directly in your classroom.', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  { icon: Users, emoji: '✨', title: 'Prompt Libraries', desc: 'Curated prompt collections to use with your class and AI tools.', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
]

export function KidsTeacherResources() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="teacher-resources" className="py-16 sm:py-24 bg-slate-950 scroll-mt-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-[15%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 right-[10%] h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.12),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300 shadow-sm"
          >
            👩‍🏫 For Educators
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="mt-5 text-3xl sm:text-[2.8rem] font-black tracking-tight text-white leading-tight"
          >
            Everything a teacher needs,{' '}
            <span className="bg-[linear-gradient(110deg,#a78bfa,#38bdf8)] bg-clip-text text-transparent">
              ready to use
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-4 text-slate-400 text-base leading-relaxed"
          >
            You don&apos;t need to be an AI expert to teach AI. Qasberry Kids gives you all the tools to bring artificial intelligence into your classroom with confidence.
          </motion.p>
        </div>

        {/* Resource grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCES.map((res, i) => {
            const Icon = res.icon
            return (
              <motion.div
                key={res.title}
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: reduceMotion ? 0 : 0.48, delay: i * 0.06 }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="group rounded-[22px] border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300 cursor-default"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl leading-none">{res.emoji}</span>
                  <div className={`h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center ${res.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm leading-snug mb-2">{res.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{res.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/courses?career=kid"
            id="kids-teacher-resources-cta"
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-slate-950 hover:bg-slate-100 shadow-[0_12px_28px_-12px_rgba(255,255,255,0.3)] hover:shadow-[0_16px_34px_-12px_rgba(255,255,255,0.4)] transition-all"
          >
            Explore the full resource library
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <span className="text-slate-500 text-sm">Free resources available — no sign-up required</span>
        </motion.div>
      </div>
    </section>
  )
}
