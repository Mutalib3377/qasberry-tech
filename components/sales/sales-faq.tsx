'use client'
// components/sales/sales-faq.tsx
// FAQ accordion for the Sales & Marketing landing page.

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { GLASS, SectionHeader } from './sales-ui'

const FAQS = [
  {
    q: 'Do I need a technical background?',
    a: 'No. The courses are written for sales and marketing people, not engineers. If you can use email and a CRM, you can follow along.',
  },
  {
    q: 'Which AI tools will I use?',
    a: 'You\'ll work with popular AI assistants and the kinds of tools sales and marketing teams already use, such as CRMs, email, social and analytics platforms. Lessons focus on skills that carry over when tools change.',
  },
  {
    q: 'How much time does it take?',
    a: 'Lessons are short and self-paced, so you can learn a little each day or work through a whole course in a weekend. You keep access so you can come back any time.',
  },
  {
    q: 'Will I get a certificate?',
    a: 'Yes. When you complete a course you receive a verifiable certificate with a shareable link you can add to your CV or LinkedIn profile.',
  },
  {
    q: 'Is it safe to use AI with customer data?',
    a: 'We cover this directly: what is safe to share with AI tools, how to protect prospect and customer information, and how to use AI responsibly at work.',
  },
  {
    q: 'Can my whole team join?',
    a: 'Yes. Each person signs up with their own account and learns at their own pace. Contact us if you would like to set up training for a larger team.',
  },
]

export function SalesFaq() {
  const [open, setOpen] = useState<number | null>(0)
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeader eyebrow="FAQ" title="Questions," accent="answered." />

        <div className="mt-12 space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className={`overflow-hidden rounded-3xl ${GLASS}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-[#0f1535]">{item.q}</span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen ? 'rotate-45 border-indigo-200 bg-indigo-600 text-white' : 'border-slate-200 bg-white/80 text-slate-600'
                    }`}
                  >
                    <Plus size={16} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.25 }}
                    >
                      <p className="px-6 pb-6 text-sm leading-relaxed text-slate-600">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
