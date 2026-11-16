'use client'
// components/kids/kids-age-bands.tsx
// "Find your age group" — the three age-band tiles, linking to the catalog
// filtered by age. Sits right under the Kids & Teens hero.

import { useRef } from 'react'
import { AgeBandTiles, type AgeCounts } from '@/components/marketing/age-band-tiles'
import { SectionHeading } from '@/components/marketing/robotics/ui'
import { useReveal } from '@/components/marketing/robotics/use-reveal'

export function KidsAgeBands({ counts }: { counts: AgeCounts }) {
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)

  return (
    <section ref={scope} id="age-groups" className="scroll-mt-24 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          tag="Find your age group"
          title="Courses for every age, 6 to 16"
          sub="Every course is tagged with the ages it suits, so learners start at the right level."
        />
        <div className="mx-auto mt-10 max-w-5xl">
          <AgeBandTiles counts={counts} />
        </div>
      </div>
    </section>
  )
}
