// components/marketing/audience-section.tsx
// Track cards ("mission briefs") in the dark robotics theme. Keeps the
// server-fed course counts and the VISIBLE_AUDIENCES single source of truth.
'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { VISIBLE_AUDIENCES, type AudienceKey } from './audiences'
import { useReveal } from './robotics/use-reveal'
import { GlowCard, SectionHeading } from './robotics/ui'
import { AgeBandTiles, type AgeCounts } from './age-band-tiles'

interface Props {
  courseCounts: Partial<Record<AudienceKey, number>>
  ageCounts: AgeCounts
}

export function AudienceSection({ courseCounts, ageCounts }: Props) {
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)
  const single = VISIBLE_AUDIENCES.length === 1

  return (
    <section ref={scope} id="tracks" className="rx-bg relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          tag={single ? 'Our track' : 'Two tracks'}
          title={
            single
              ? 'Built for young learners, from the ground up.'
              : 'One academy. Two audiences we know deeply.'
          }
          sub={
            single
              ? "We don't try to teach everyone. Every course is designed for young learners, with support for the parents and teachers guiding them."
              : "We don't try to teach everyone. We build AI learning for young learners and for the people who drive revenue."
          }
        />

        <div className={`mt-12 grid grid-cols-1 gap-5 ${single ? 'mx-auto max-w-3xl' : 'lg:grid-cols-2'}`}>
          {VISIBLE_AUDIENCES.map((audience, index) => {
            const Icon = audience.icon
            const count = courseCounts[audience.key] ?? 0

            return (
              <div key={audience.key} data-reveal data-reveal-delay={`${index * 0.1}`}>
                <GlowCard className="h-full rounded-[28px]">
                  <Link href={audience.href} className="flex h-full flex-col p-7 sm:p-9">
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-rx-violet-line bg-rx-violet-tint text-rx-violet-ink">
                        <Icon size={22} />
                      </span>
                      <span className="rounded-full border border-rx-line-strong bg-rx-chip px-3 py-1.5 font-hud text-[10px] uppercase tracking-[0.18em] text-rx-muted">
                        {audience.who}
                      </span>
                    </div>

                    <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-rx-text sm:text-3xl">
                      {audience.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-rx-muted sm:text-base">{audience.pitch}</p>

                    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {audience.outcomes.map((outcome) => (
                        <li key={outcome} className="flex items-start gap-2.5 text-sm text-rx-text-2">
                          <Check size={15} className="mt-0.5 shrink-0 text-rx-cyan-ink" />
                          {outcome}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
                      <div className="flex gap-2.5">
                        <div className="rounded-xl border border-rx-line bg-rx-chip px-3.5 py-2">
                          <p className="font-hud text-[10px] uppercase tracking-[0.14em] text-rx-dim">Courses</p>
                          <p className="mt-0.5 text-sm font-bold text-rx-text">
                            {count > 0 ? count : 'Coming soon'}
                          </p>
                        </div>
                        <div className="rounded-xl border border-rx-line bg-rx-chip px-3.5 py-2">
                          <p className="font-hud text-[10px] uppercase tracking-[0.14em] text-rx-dim">Level</p>
                          <p className="mt-0.5 text-sm font-bold text-rx-text">{audience.level}</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-rx-cyan-ink">
                        {audience.cta}
                        <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </GlowCard>
              </div>
            )
          })}
        </div>

        {/* Age bands — each links to the catalog filtered to that band */}
        <div className="mx-auto mt-12 max-w-5xl">
          <p data-reveal className="rx-hud mb-5 text-center">Find courses by age</p>
          <AgeBandTiles counts={ageCounts} />
        </div>
      </div>
    </section>
  )
}
