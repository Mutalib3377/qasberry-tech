'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Briefcase, GraduationCap, HeartPulse, Landmark, MonitorSmartphone, Megaphone, Scale, UserCog } from 'lucide-react'

interface Career { id: string; name: string; slug: string; courseCount: number }
interface Props   { careers: Career[] }

const CAREER_META: Record<string, { description: string; level: string; duration: string; icon: typeof Briefcase }> = {
  developer:    { description: 'Ship AI-enabled products and coding workflows with confidence.', level: 'Intermediate', duration: '6-8 weeks', icon: MonitorSmartphone },
  entrepreneur: { description: 'Use AI systems to improve operations, product velocity, and scale.', level: 'Beginner', duration: '5-7 weeks', icon: Briefcase },
  lawyer:       { description: 'Modernize legal research, drafting, and case preparation.', level: 'Intermediate', duration: '6 weeks', icon: Scale },
  marketer:     { description: 'Design higher-performing campaigns with AI insights and automation.', level: 'Beginner', duration: '4-6 weeks', icon: Megaphone },
  nurse:        { description: 'Improve patient documentation and decision support workflows.', level: 'Beginner', duration: '5 weeks', icon: HeartPulse },
  student:      { description: 'Build AI fluency for research, writing, and professional readiness.', level: 'Beginner', duration: '4 weeks', icon: GraduationCap },
  teacher:      { description: 'Create adaptive lesson plans and better learner support systems.', level: 'Beginner', duration: '5 weeks', icon: UserCog },
  finance:      { description: 'Apply AI to forecasting, reporting, and operational intelligence.', level: 'Intermediate', duration: '7 weeks', icon: Landmark },
}

const DEFAULT_META = {
  description: 'Discover practical AI systems tailored for your profession.',
  level: 'Beginner',
  duration: '4-6 weeks',
  icon: Briefcase,
}

export function CareersSection({ careers }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()

  return (
    <section id="careers" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Career tracks
          </span>
          <h2 className="mt-5 text-3xl sm:text-[3rem] font-bold tracking-tight text-slate-950">Choose your profession. Get a roadmap that feels custom-built.</h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">Collectible card-style tracks with practical AI pathways for each role.</p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {careers.map((career) => {
            const meta = CAREER_META[career.slug] ?? DEFAULT_META
            const Icon = meta.icon
            const isHovered = hovered === career.id

            return (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: reduceMotion ? 0 : 0.45 }}
                whileHover={reduceMotion ? undefined : { y: -6, rotateX: 2.8, rotateY: -2.8 }}
                onMouseEnter={() => setHovered(career.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Link
                  href={`/courses?career=${career.slug}`}
                  className="group relative block h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_20px_52px_-36px_rgba(15,23,42,0.35)]"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_84%_8%,rgba(111,97,255,0.16),transparent_36%),radial-gradient(circle_at_12%_84%,rgba(77,196,255,0.16),transparent_38%)]" />

                  <div className="relative h-28 rounded-2xl border border-slate-200 bg-[#fafafc] px-4 py-3 overflow-hidden">
                    <div className="absolute -right-6 -bottom-8 h-20 w-20 rounded-full bg-indigo-100 blur-xl" />
                    <div className="absolute -left-5 -top-5 h-16 w-16 rounded-full bg-cyan-100 blur-xl" />
                    <div className="relative flex items-start justify-between">
                      <span className="h-10 w-10 rounded-xl border border-slate-200 bg-white inline-flex items-center justify-center text-indigo-500">
                        <Icon size={18} />
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase font-semibold text-slate-500">
                        {meta.level}
                      </span>
                    </div>

                    <div className="relative mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: '20%' }}
                        animate={{ width: isHovered ? '82%' : '58%' }}
                        transition={{ duration: 0.45 }}
                        className="h-full rounded-full bg-[linear-gradient(110deg,#6b61ff,#45b8ff)]"
                      />
                    </div>
                    <p className="relative mt-2 text-[11px] text-slate-500">Roadmap preview</p>
                  </div>

                  <div className="relative mt-5">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">{career.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 min-h-[48px]">{meta.description}</p>
                  </div>

                  <div className="relative mt-5 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-slate-500">Estimated time</p>
                      <p className="mt-1 text-slate-900 font-semibold">{meta.duration}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-slate-500">Courses</p>
                      <p className="mt-1 text-slate-900 font-semibold">{career.courseCount}</p>
                    </div>
                  </div>

                  <div className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    Start track
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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
