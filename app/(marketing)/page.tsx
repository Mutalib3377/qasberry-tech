// app/(marketing)/page.tsx
// Qasberry public homepage. MVP: Kids & Teens track only — other tracks are
// switched off in lib/features.ts.
// Server component: fetches published course counts per track from DB.

import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { HeroSection }     from '@/components/marketing/hero-section'
import { TrustSection }    from '@/components/marketing/trust-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { AudienceSection } from '@/components/marketing/audience-section'
import { HowItWorks }      from '@/components/marketing/how-it-works'
import { LessonPreviewSection } from '@/components/marketing/lesson-preview-section'
import { CtaBanner }       from '@/components/marketing/cta-banner'
import { MarketingShell }  from '@/components/marketing/marketing-shell'
import { VISIBLE_AUDIENCES, type AudienceKey } from '@/components/marketing/audiences'
import { visibleCareerWhere } from '@/lib/features'
import { getAgeGroupCounts } from '@/lib/age-group-counts'
import { getLessonShowcase } from '@/lib/lesson-showcase'

export const metadata: Metadata = {
  // MVP: original — 'Qasberry — AI Learning for Kids, Youth & Sales Professionals'
  // absolute: already branded, so skip the root '%s | Qasberry' template
  title: { absolute: 'Qasberry Kids & Teens — Fun, Safe AI Learning for Young Learners' },
  description:
    'Qasberry teaches AI to young learners through short, playful lessons and real projects, with guides for parents and teachers.',
}

export default async function HomePage() {
  const [trackCounts, publishedCourseCount, ageCounts, showcase] = await Promise.all([
    Promise.all(
      VISIBLE_AUDIENCES.map((audience) =>
        db.course.count({
          where: { status: 'PUBLISHED', career: { slug: { in: audience.careerSlugs } } },
        })
      )
    ),
    db.course.count({ where: { status: 'PUBLISHED', ...visibleCareerWhere() } }),
    getAgeGroupCounts(),
    getLessonShowcase(),
  ])

  const courseCounts = Object.fromEntries(
    VISIBLE_AUDIENCES.map((audience, i) => [audience.key, trackCounts[i]])
  ) as Partial<Record<AudienceKey, number>>

  return (
    <MarketingShell width="full">
      <HeroSection />
      <TrustSection />
      <AudienceSection courseCounts={courseCounts} ageCounts={ageCounts} />
      <FeaturesSection />
      {showcase && <LessonPreviewSection data={showcase} />}
      <HowItWorks />
      <CtaBanner courseCount={publishedCourseCount} />
    </MarketingShell>
  )
}
