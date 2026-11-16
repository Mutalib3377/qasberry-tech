// components/marketing/age-band-tiles.tsx
// Three age-band tiles (6–9, 10–12, 13–16), each linking to the catalog
// filtered to that band, with its published-course count. Used on the
// homepage tracks section and the Kids & Teens page.
'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { AgeGroup } from '@prisma/client'
import { AGE_GROUPS } from '@/lib/age-groups'
import { GlowCard } from './robotics/ui'

export type AgeCounts = Partial<Record<AgeGroup, number>>

const BLURBS: Record<AgeGroup, string> = {
  AGES_6_9: 'Playful, visual first steps into how AI works.',
  AGES_10_12: 'Hands-on projects: chatbots, stories and games.',
  AGES_13_16: 'Deeper builds, real tools and responsible AI.',
}

const ACCENTS: Record<AgeGroup, string> = {
  AGES_6_9: 'text-rx-violet-ink',
  AGES_10_12: 'rx-gradient-text',
  AGES_13_16: 'text-rx-cyan-ink',
}

export function AgeBandTiles({ counts }: { counts: AgeCounts }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {AGE_GROUPS.map((g, index) => {
        const count = counts[g.value] ?? 0
        return (
          <div key={g.value} data-reveal data-reveal-delay={`${index * 0.08}`}>
            <GlowCard className="h-full rounded-[22px]">
              <Link href={`/courses?age=${g.param}`} className="flex h-full flex-col p-6">
                <span className="rx-hud">Ages</span>
                <span className={`mt-1 font-display text-4xl font-bold tracking-tight ${ACCENTS[g.value]}`}>
                  {g.min}–{g.max}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-rx-muted">{BLURBS[g.value]}</p>
                <span className="mt-auto flex items-center justify-between pt-5 text-sm font-semibold">
                  <span className="text-rx-text-2">
                    {count > 0 ? `${count} course${count === 1 ? '' : 's'}` : 'Coming soon'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-rx-cyan-ink">
                    Browse
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </GlowCard>
          </div>
        )
      })}
    </div>
  )
}
