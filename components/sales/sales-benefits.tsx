'use client'
// components/sales/sales-benefits.tsx
// Bento grid of why-Qasberry benefits, in glass cards.

import { motion, useReducedMotion } from 'framer-motion'
import { Award, Clock3, Layers, ShieldCheck, Target, Users } from 'lucide-react'
import { GLASS, SectionHeader } from './sales-ui'

const BENEFITS = [
  {
    icon: Target,
    title: 'Built for revenue roles',
    body: 'Every lesson is written for sales and marketing work: pipelines, campaigns and customers, not generic AI theory.',
    span: 'lg:col-span-2',
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Clock3,
    title: 'Learn between meetings',
    body: 'Short, self-paced lessons that fit a busy week.',
    span: '',
    accent: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Layers,
    title: 'Use it the same day',
    body: 'Each lesson ends with a workflow you can try at work right away.',
    span: '',
    accent: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Award,
    title: 'Certificate you can share',
    body: 'Finish a course to earn a verifiable certificate for your CV or LinkedIn profile.',
    span: '',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    icon: Users,
    title: 'Learn with peers',
    body: 'Swap prompts, workflows and wins with other sales and marketing pros in the community.',
    span: '',
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: ShieldCheck,
    title: 'Responsible with customer data',
    body: 'Learn how to use AI safely with prospect and customer information, including privacy basics and what not to paste into AI tools.',
    span: 'lg:col-span-3',
    accent: 'from-fuchsia-500 to-violet-500',
  },
]

export function SalesBenefits() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Why Qasberry"
          title="AI training that"
          accent="actually sticks."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, body, span, accent }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: reduceMotion ? 0 : 0.48, delay: i * 0.06 }}
              className={`group relative overflow-hidden rounded-[28px] p-7 ${GLASS} ${span} ${span.includes('col-span-3') ? 'sm:col-span-2' : ''}`}
            >
              <div aria-hidden className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25`} />
              <span className={`relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-[0_10px_22px_-10px_rgba(79,70,229,0.6)]`}>
                <Icon size={20} />
              </span>
              <h3 className="relative mt-5 text-lg font-bold tracking-tight text-[#0f1535]">{title}</h3>
              <p className="relative mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
