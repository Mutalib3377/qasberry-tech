'use client'
// components/kids/kids-faq.tsx
// Accordion FAQ — 8 questions covering age, format, teacher resources, certs, YouTube, future.
// Client component with smooth height animation using framer-motion.

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'What age group is Qasberry Kids & Teens designed for?',
    a: 'Qasberry Kids & Teens is designed for children aged 6 to 16. Every course is tagged with the age bands it suits — 6–9, 10–12 and 13–16 — and you can filter the course catalog by age. Younger learners get simpler, more visual content, while older students take on more structured, project-based learning.',
  },
  {
    q: 'What format do the lessons take?',
    a: 'Each lesson is broken into short, engaging segments — typically 5 to 15 minutes each. They include video explanations, interactive activities, quizzes, and creative projects. The format is designed to hold children\'s attention while ensuring genuine understanding.',
  },
  {
    q: 'What teacher resources are included?',
    a: 'Every lesson comes with a complete teacher pack — including a lesson plan, presentation slides, student worksheets (printable and digital), classroom activity guides, and assessment templates. Teachers don\'t need any prior AI knowledge to use these resources confidently.',
  },
  {
    q: 'Do children receive certificates?',
    a: 'Yes! Children receive a Qasberry Kids & Teens certificate upon completing each course or learning track. Certificates are shareable and can be downloaded as a PDF. Earning a certificate is designed to feel like a real achievement — not just a participation reward.',
  },
  {
    q: 'Is the YouTube content free?',
    a: 'Absolutely. The Qasberry YouTube channel is completely free and always will be. It features fun explainer videos, AI experiments, project tutorials, and beginner-friendly lessons. It\'s the perfect starting point for children curious about AI before diving into the full platform.',
  },
  {
    q: 'Do I need any special technology or software?',
    a: 'No special software is required. Qasberry Kids & Teens runs entirely in your web browser — on computers, tablets, and even smartphones. For classroom use, any device with internet access and a modern browser is all you need.',
  },
  {
    q: 'What happens after a child completes all the lessons?',
    a: 'Qasberry Kids & Teens is designed to grow with learners. After completing their current track, children can advance to higher difficulty levels, take on AI project challenges, explore new topic areas, or transition to the main Qasberry Academy for more advanced career-focused AI education.',
  },
  {
    q: 'Is Qasberry Kids & Teens safe and appropriate for children?',
    a: 'Child safety is our top priority. All content on Qasberry Kids & Teens is carefully reviewed for age-appropriateness. We do not collect unnecessary personal data from children, all lessons are moderated, and our AI safety curriculum actively teaches children how to use technology responsibly and ethically.',
  },
]

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="border-b border-rx-line last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-rx-text text-sm sm:text-base leading-snug pr-2">{q}</span>
        <span className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center border transition-colors duration-200 ${isOpen ? 'border-violet-300 dark:border-violet-400/40 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300' : 'border-rx-line bg-rx-chip text-rx-muted'}`}>
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-rx-body leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function KidsFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 sm:py-24 bg-rx-chip">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-rx-line bg-rx-sheet px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-rx-body shadow-sm"
          >
            Common Questions
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="mt-5 text-3xl sm:text-[2.8rem] font-black tracking-tight text-rx-text leading-tight"
          >
            Frequently asked{' '}
            <span className="bg-[linear-gradient(110deg,#635bff,#38bdf8)] bg-clip-text text-transparent">
              questions
            </span>
          </motion.h2>
        </div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-[28px] border border-rx-line bg-rx-sheet p-6 sm:p-8 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.12)]"
        >
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.q}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
