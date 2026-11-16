// components/marketing/trust-section.tsx
// "Mission parameters": who Qasberry is built for. Dark robotics theme —
// an infinite marquee of audiences plus four scroll-revealed HUD cards.
'use client'

import { useRef } from 'react'
import { BadgeCheck, Briefcase, ShieldCheck, Target } from 'lucide-react'
import { useReveal } from './robotics/use-reveal'
import { GlowCard, SectionHeading } from './robotics/ui'

const TRUST_SIGNALS = [
  {
    title: 'Made for young learners',
    body: 'Every lesson is written for young learners, never generic AI hype.',
    icon: Target,
    code: 'SPEC-01',
  },
  {
    title: 'Learn by doing',
    body: 'Learners build real projects in every lesson: chatbots, stories, games and art.',
    icon: Briefcase,
    code: 'SPEC-02',
  },
  {
    title: 'Safe and responsible',
    body: 'Age-appropriate content and healthy, privacy-first AI habits from day one.',
    icon: ShieldCheck,
    code: 'SPEC-03',
  },
  {
    title: 'Proof of progress',
    body: 'Certificates that show parents and schools what was actually learned.',
    icon: BadgeCheck,
    code: 'SPEC-04',
  },
]

const AUDIENCE_CHIPS = ['YOUTH', 'TEENS', 'PARENTS', 'TEACHERS', 'SCHOOLS']

function MarqueeRow() {
  const items = [...AUDIENCE_CHIPS, ...AUDIENCE_CHIPS]
  return (
    <div className="rx-marquee relative" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 rx-fade-left" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 rx-fade-right" />
      {[0, 1].map((copy) => (
        <div key={copy} className="rx-marquee-track items-center gap-10 py-1 pr-10">
          {items.map((label, i) => (
            <span key={`${copy}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
              <span className="h-1 w-1 rounded-full bg-rx-cyan opacity-60" />
              <span className="font-hud text-xs uppercase tracking-[0.3em] text-rx-dim">{label}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export function TrustSection() {
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)

  return (
    <section ref={scope} className="rx-bg relative py-20 sm:py-24" aria-label="Who Qasberry is for">
      {/* Top divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--rx-cyan-line),transparent)]" aria-hidden />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal>
          <MarqueeRow />
          <p className="sr-only">For youth, teens, parents, teachers and schools.</p>
        </div>

        <div className="mt-16">
          <SectionHeading
            tag="Who it's for"
            title="Focused AI learning for the next generation."
            sub="Instead of courses for everyone, we go deep on young learners building future-ready skills, and on the parents and teachers who support them."
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_SIGNALS.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={item.title} data-reveal data-reveal-delay={`${index * 0.08}`}>
                <GlowCard className="h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rx-line-strong bg-rx-cyan-tint text-rx-cyan-ink">
                      <Icon size={18} />
                    </span>
                    <span className="font-hud text-[10px] tracking-[0.2em] text-rx-faint">{item.code}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-rx-text">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-rx-muted">{item.body}</p>
                </GlowCard>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
