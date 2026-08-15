'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { QasberryBotInput } from './qasberry-bot-input'

const HERO_VIDEO_SRC = '/MASTER_CINEMATIC_VIDEO_PROMPT.mp4'
const HERO_VIDEO_POSTER = '/logo.png'

const FLOATING_CARDS = [
  {
    title: 'Career context mapped',
    detail: 'Nurse track signal: high confidence',
    className: 'top-8 left-2 sm:left-4',
    rotate: -6,
  },
  {
    title: 'Curriculum synthesis',
    detail: 'Roadmap assembled with 3 learning arcs',
    className: 'top-32 right-0 sm:right-2',
    rotate: 5,
  },
  {
    title: 'AI skill projection',
    detail: 'Estimated completion: 6 weeks',
    className: 'bottom-10 left-10 sm:left-20',
    rotate: -3,
  },
]

function NetworkVisual() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative w-full max-w-[460px] aspect-square">
      <div className="absolute inset-0 rounded-[42px] bg-[radial-gradient(circle_at_20%_10%,rgba(107,95,255,0.24),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(93,177,255,0.22),transparent_46%),radial-gradient(circle_at_60%_80%,rgba(99,224,255,0.24),transparent_42%)]" />
      <div className="absolute inset-5 rounded-[36px] border border-slate-200/70 bg-white/72 backdrop-blur-xl shadow-[0_40px_90px_-56px_rgba(15,23,42,0.45)] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.6),rgba(255,255,255,0.1)_48%,rgba(255,255,255,0.6))]" />
        <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7a70ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#57c7ff" stopOpacity="0.45" />
            </linearGradient>
          </defs>
          <path d="M82 142C164 166 236 180 350 122" stroke="url(#line)" strokeWidth="2" fill="none" />
          <path d="M162 238C236 242 306 264 390 332" stroke="url(#line)" strokeWidth="2" fill="none" />
          <path d="M110 324C190 290 270 236 348 178" stroke="url(#line)" strokeWidth="2" fill="none" />
          <path d="M120 100C188 132 244 196 262 258" stroke="url(#line)" strokeWidth="2" fill="none" />
        </svg>
        {[{ x: '14%', y: '24%' }, { x: '37%', y: '44%' }, { x: '68%', y: '30%' }, { x: '71%', y: '69%' }, { x: '24%', y: '66%' }].map((node, index) => (
          <motion.span
            key={`${node.x}-${node.y}`}
            style={{ left: node.x, top: node.y }}
            animate={reduceMotion ? undefined : { scale: [1, 1.22, 1], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 3.6 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-3.5 w-3.5 rounded-full bg-[linear-gradient(140deg,#6f61ff,#53cfff)] shadow-[0_0_0_6px_rgba(104,132,255,0.14)]"
          />
        ))}

        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-3 rounded-2xl border border-slate-200 bg-white/95 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)]"
        >
          <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">Qasberry AI Core</div>
          <div className="text-sm font-semibold text-slate-900 mt-1">Learning Graph Active</div>
        </motion.div>
      </div>

      {FLOATING_CARDS.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: index * 0.12, duration: 0.5 }}
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          className={[
            'absolute z-10 px-3 py-2 rounded-xl border border-slate-200 bg-white/86 backdrop-blur-sm shadow-[0_12px_30px_-28px_rgba(15,23,42,0.34)]',
            card.className,
          ].join(' ')}
          style={{ transform: `rotate(${card.rotate}deg)` }}
        >
          <div className="text-[11px] font-semibold text-slate-900 leading-tight">{card.title}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{card.detail}</div>
        </motion.div>
      ))}
    </div>
  )
}

export function HeroSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden pt-32 sm:pt-36 pb-20 sm:pb-28">
      <div className="pointer-events-none absolute inset-0">
        {!reduceMotion && HERO_VIDEO_SRC && (
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={HERO_VIDEO_POSTER}
            aria-hidden
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-white/70" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-[10%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(109,101,255,0.24),transparent_65%)]" />
        <div className="absolute top-20 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(96,197,255,0.2),transparent_68%)]" />
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 h-[420px] w-[920px] bg-[radial-gradient(ellipse,rgba(116,144,255,0.16),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 0.46 }}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white/86 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm"
            >
              Premium AI Learning Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.06 }}
              className="mt-6 text-[2.65rem] leading-[1.1] sm:text-[4.4rem] lg:text-[5.2rem] font-black tracking-[-0.04em] text-slate-950"
            >
              A refined AI academy for <span className="bg-[linear-gradient(110deg,#635bff,#3ca9f8)] bg-clip-text text-transparent">modern careers.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.14 }}
              className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600"
            >
              Tell Qasberry what you do. Instantly receive a career-calibrated AI roadmap with practical courses, workflows, and certifications designed for real work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 0.6, delay: 0.2 }}
              className="mt-9"
            >
              <QasberryBotInput />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 0.48, delay: 0.24 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/courses"
                className="group inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:text-slate-950 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                Explore courses
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/community"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <PlayCircle size={16} />
                See learner stories
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: reduceMotion ? 0 : 0.72, delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <NetworkVisual />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
