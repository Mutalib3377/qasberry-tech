'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Compass, Layers, Trophy } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    title:  'Pick Your Track',
    body:   'Choose Kids & Youth or Sales & Marketing to see courses made for you.',
    icon: Compass,
  },
  {
    number: '02',
    title:  'Learn by Doing',
    body:   'Work through short lessons, quizzes and hands-on projects at your own pace.',
    icon: Layers,
  },
  {
    number: '03',
    title:  'Show What You Can Do',
    body:   'Earn a certificate and use your new AI skills in class, at work and in your career.',
    icon: Trophy,
  },
]

export function HowItWorks() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="how" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: reduceMotion ? 0 : 0.48 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full border border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            How it works
          </span>
          <h2 className="mt-5 text-3xl sm:text-[3rem] leading-[1.15] font-bold tracking-tight text-slate-950">From curious to confident in three steps.</h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">A simple path with structure, practice and progress you can see.</p>
        </motion.div>

        <div className="relative mt-12">
          <div className="hidden lg:block absolute top-[42px] left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-indigo-200 via-blue-200 to-cyan-200" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {STEPS.map((step, index) => {
              const Icon = step.icon

              return (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-70px' }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, delay: index * 0.08 }}
                  className="relative rounded-[28px] border border-slate-200 bg-white p-6 sm:p-7 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.34)]"
                >
                  <div className="absolute -top-3 right-5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-500">
                    Step {step.number}
                  </div>

                  <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50 inline-flex items-center justify-center text-indigo-500">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">{step.body}</p>

                  <motion.div
                    initial={{ scaleX: 0.25, opacity: 0.5 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: reduceMotion ? 0 : 0.6, delay: 0.2 + index * 0.12 }}
                    className="mt-6 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 origin-left"
                  />
                </motion.article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
