// app/(marketing)/page.tsx
// Qasberry public homepage. MVP: Youth track only — other tracks are
// switched off in lib/features.ts.
// Server component: fetches published course counts per track from DB.

import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { MarketingNav }    from '@/components/marketing/marketing-nav'
import { HeroSection }     from '@/components/marketing/hero-section'
import { TrustSection }    from '@/components/marketing/trust-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { AudienceSection } from '@/components/marketing/audience-section'
import { HowItWorks }      from '@/components/marketing/how-it-works'
import { CtaBanner }       from '@/components/marketing/cta-banner'
import { Footer }          from '@/components/marketing/footer'
import { VISIBLE_AUDIENCES, type AudienceKey } from '@/components/marketing/audiences'
import { visibleCareerWhere } from '@/lib/features'

export const metadata: Metadata = {
  // MVP: original — 'Qasberry — AI Learning for Kids, Youth & Sales Professionals'
  title: 'Qasberry Youth — Fun, Safe AI Learning for Young Learners',
  description:
    'Qasberry teaches AI to young learners through short, playful lessons and real projects, with guides for parents and teachers.',
}

export default async function HomePage() {
  const [trackCounts, publishedCourseCount] = await Promise.all([
    Promise.all(
      VISIBLE_AUDIENCES.map((audience) =>
        db.course.count({
          where: { status: 'PUBLISHED', career: { slug: { in: audience.careerSlugs } } },
        })
      )
    ),
    db.course.count({ where: { status: 'PUBLISHED', ...visibleCareerWhere() } }),
  ])

  const courseCounts = Object.fromEntries(
    VISIBLE_AUDIENCES.map((audience, i) => [audience.key, trackCounts[i]])
  ) as Partial<Record<AudienceKey, number>>

  return (
    <div className="min-h-screen bg-white text-[#101114] overflow-x-hidden">
      <MarketingNav />
      <HeroSection />
      <TrustSection />
      <AudienceSection courseCounts={courseCounts} />
      <FeaturesSection />
      <HowItWorks />
      <CtaBanner courseCount={publishedCourseCount} />
      <Footer />
    </div>
  )
}
