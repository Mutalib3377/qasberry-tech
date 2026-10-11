'use client'
// components/sales/sales-showcase.tsx
// "See AI at work" — steps on the left, a glass mock of an AI assistant
// drafting a sales follow-up on the right.

import { motion, useReducedMotion } from 'framer-motion'
import { Flame, Search, Send, Sparkles, Wand2, Zap } from 'lucide-react'
import { GLASS, SectionHeader } from './sales-ui'

const STEPS = [
  {
    icon: Search,
    title: 'Research in minutes',
    body: 'Use AI to summarise a prospect, their company and what they care about before you reach out.',
  },
  {
    icon: Wand2,
    title: 'Write messages that sound like you',
    body: 'Turn that research into personalised emails, posts and ads, then refine the tone with one prompt.',
  },
  {
    icon: Zap,
    title: 'Automate the follow-through',
    body: 'Connect AI to your CRM and tools so follow-ups, reports and hand-offs happen on time.',
  },
]

const EMAIL_LINES = [
  'Hi Sarah,',
  'Thanks for grabbing our pricing guide. Teams like Brightline usually look at it when manual reporting starts slowing things down.',
  'Would a 15-minute call on Thursday help? I can show how other ops teams cut that work in half.',
]

function AssistantMock() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-6 rounded-[40px] bg-[radial-gradient(circle_at_30%_20%,rgba(129,140,248,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(192,132,252,0.3),transparent_55%)] blur-2xl" />

      <div className={`relative overflow-hidden rounded-[28px] ${GLASS}`}>
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/70 bg-white/50 px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Sparkles size={13} className="text-indigo-500" />
            AI Sales Assistant
          </span>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {/* Prompt */}
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[linear-gradient(120deg,#5b5cf6,#4f46e5)] px-4 py-3 text-sm leading-relaxed text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.8)]">
            Write a short follow-up for Sarah, Head of Ops at Brightline. She downloaded our pricing guide yesterday.
          </div>

          {/* Response */}
          <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white bg-white/85 px-4 py-4 text-sm leading-relaxed text-slate-700 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-500">Draft email</p>
            <div className="mt-2 space-y-2">
              {EMAIL_LINES.map((line, i) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: reduceMotion ? 0 : 0.4, delay: 0.3 + i * 0.35 }}
                >
                  {line}
                </motion.p>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Shorter', 'More casual', 'Add a case study'].map((chip) => (
                <span key={chip} className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 py-1.5 pl-4 pr-1.5">
            <span className="flex-1 truncate text-sm text-slate-400">Ask AI to refine, translate or schedule…</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1,#7c3aed)] text-white">
              <Send size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* Floating insight chips */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -right-3 -top-6 hidden sm:flex items-center gap-2.5 rounded-2xl px-4 py-3 ${GLASS}`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
          <Flame size={18} />
        </span>
        <span>
          <span className="block text-[11px] text-slate-500">Lead score</span>
          <span className="block text-sm font-bold text-[#0f1535]">86 · Hot lead</span>
        </span>
      </motion.div>
    </div>
  )
}

export function SalesShowcase() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="See it in action"
          title="Less busywork."
          accent="More closing."
          body="You'll learn hands-on workflows like this one: real tasks from a sales and marketing week, done faster with AI."
        />

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ol className="space-y-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: reduceMotion ? 0 : 0.45, delay: i * 0.1 }}
                className={`flex gap-5 rounded-3xl p-5 sm:p-6 ${GLASS}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#eef2ff,#ede9fe)] text-indigo-600">
                  <Icon size={22} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500">Step {i + 1}</p>
                  <h3 className="mt-1 text-lg font-bold text-[#0f1535]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: reduceMotion ? 0 : 0.6 }}
          >
            <AssistantMock />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
