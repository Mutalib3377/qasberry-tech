// components/marketing/features-section.tsx
// "Why Qasberry" bento grid in the dark robotics theme.
'use client'

import { useRef } from 'react'
import { SHOW_COMMUNITY } from '@/lib/features'
import { BadgeCheck, BookOpen, Clock3, Lock, Network, Users2 } from 'lucide-react'
import { useReveal } from './robotics/use-reveal'
import { GlowCard, SectionHeading } from './robotics/ui'

const FEATURE_CARDS = [
  {
    icon: Network,
    title: 'A Clear Learning Path',
    body: 'Step-by-step learning paths for young learners, so they always know what to learn next.',
    className: 'lg:col-span-2 lg:row-span-1',
    code: 'MOD-01',
  },
  {
    icon: BookOpen,
    title: 'Real Tools, Real Results',
    body: 'Hands-on lessons with real AI tools, made safe and simple for young learners.',
    className: 'lg:col-span-1',
    code: 'MOD-02',
  },
  {
    icon: Clock3,
    title: 'Bite-Sized Lessons',
    body: 'Short lessons that fit after school or on a weekend.',
    className: 'lg:col-span-1',
    code: 'MOD-03',
  },
  ...(SHOW_COMMUNITY
    ? [
        {
          icon: Users2,
          title: 'Community',
          body: 'Share projects, prompts and wins with other learners on your track.',
          className: 'lg:col-span-1',
          code: 'MOD-04',
        },
      ]
    : []),
  {
    icon: BadgeCheck,
    title: 'Verifiable Credentials',
    body: 'Earn certificates that prove real AI skills, ready for school portfolios.',
    // Fills the Community card's slot while community is hidden
    className: SHOW_COMMUNITY ? 'lg:col-span-1' : 'lg:col-span-2',
    code: SHOW_COMMUNITY ? 'MOD-05' : 'MOD-04',
  },
  {
    icon: Lock,
    title: 'Responsible AI by Design',
    body: 'Online safety, privacy and AI ethics for young learners, built into every path.',
    className: 'sm:col-span-2 lg:col-span-3',
    code: SHOW_COMMUNITY ? 'MOD-06' : 'MOD-05',
  },
]

export function FeaturesSection() {
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)

  return (
    <section ref={scope} id="features" className="rx-bg relative py-20 sm:py-24">
      {/* Faint blueprint grid behind the bento */}
      <div className="rx-grid rx-grid-fade absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          tag="Why Qasberry"
          title={
            <>
              AI learning that&apos;s focused,
              <br className="hidden sm:block" /> <span className="rx-gradient-text">practical and fun.</span>
            </>
          }
          sub="Every course is built for young learners, and for the grown-ups helping them."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {FEATURE_CARDS.map(({ icon: Icon, title, body, className, code }, index) => (
            <div key={title} data-reveal data-reveal-delay={`${index * 0.06}`} className={className}>
              <GlowCard className="h-full rounded-[26px] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rx-line-strong bg-rx-violet-tint text-rx-violet-ink transition-colors duration-300 group-hover:text-rx-cyan-ink">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className="font-hud text-[10px] tracking-[0.2em] text-rx-faint">{code}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-rx-text">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-rx-muted">{body}</p>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
