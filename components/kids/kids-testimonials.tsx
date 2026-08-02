'use client'
// components/kids/kids-testimonials.tsx
// 3-column testimonials — teacher, parent, student.
// Staggered scroll entrance, star ratings, avatar initials.

import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    role:   'Primary School Teacher',
    name:   'Ms. Sarah O.',
    avatar: 'SO',
    color:  'from-violet-500 to-indigo-500',
    bg:     'bg-violet-50',
    stars:  5,
    quote:  "Qasberry Kids has transformed how I introduce technology to my Year 4 class. The lesson plans are incredibly well-structured — I walked in on my first AI lesson feeling genuinely confident, and the children were absolutely engaged from minute one.",
  },
  {
    role:   'Parent of a 9-year-old',
    name:   'David T.',
    avatar: 'DT',
    color:  'from-sky-500 to-blue-500',
    bg:     'bg-sky-50',
    stars:  5,
    quote:  "My daughter comes home from school excited to show me what she learned about AI. She built her first 'AI story generator' project last week and was so proud. Qasberry Kids makes the subject approachable and genuinely fun without dumbing it down.",
  },
  {
    role:   'Student, Age 13',
    name:   'Amara K.',
    avatar: 'AK',
    color:  'from-amber-400 to-orange-500',
    bg:     'bg-amber-50',
    stars:  5,
    quote:  "I thought AI was just something adults used at work, but now I understand how it actually works and I've made my own AI art project! The quizzes are actually fun and earning my certificate made me feel like a real programmer.",
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  )
}

export function KidsTestimonials() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="py-16 sm:py-24">
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
            ❤️ What People Say
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="mt-5 text-3xl sm:text-[2.8rem] font-black tracking-tight text-slate-950 leading-tight"
          >
            Loved by learners,{' '}
            <span className="bg-[linear-gradient(110deg,#635bff,#38bdf8)] bg-clip-text text-transparent">
              trusted by teachers
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-4 text-slate-500 text-base leading-relaxed"
          >
            Real outcomes from the Qasberry Kids community — children, parents, and educators sharing their experiences.
          </motion.p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: reduceMotion ? 0 : 0.52, delay: i * 0.1 }}
              className="group relative rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.15)] hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.22)] hover:border-slate-300 transition-all duration-300 flex flex-col"
            >
              {/* Quote mark */}
              <div className="text-5xl font-black text-slate-100 leading-none mb-4 select-none">&ldquo;</div>

              {/* Stars */}
              <Stars count={t.stars} />

              {/* Quote text */}
              <blockquote className="mt-4 text-slate-700 text-sm leading-relaxed flex-1">
                {t.quote}
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-100">
                {/* Avatar */}
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-black text-white">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
