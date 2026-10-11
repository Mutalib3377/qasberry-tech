// app/(marketing)/page.tsx
// Qasberry public homepage — focused on two audiences: Kids & Youth, and
// Sales & Marketing professionals.
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
import { AUDIENCES, type AudienceKey } from '@/components/marketing/audiences'

export const metadata: Metadata = {
  title: 'Qasberry — AI Learning for Kids, Youth & Sales Professionals',
  description:
    'Qasberry teaches AI to kids and teens getting ready for the future, and to sales and marketing professionals who want to win more with AI.',
}

export default async function HomePage() {
  const [trackCounts, publishedCourseCount] = await Promise.all([
    Promise.all(
      AUDIENCES.map((audience) =>
        db.course.count({
          where: { status: 'PUBLISHED', career: { slug: { in: audience.careerSlugs } } },
        })
      )
    ),
    db.course.count({ where: { status: 'PUBLISHED' } }),
  ])

  const courseCounts = Object.fromEntries(
    AUDIENCES.map((audience, i) => [audience.key, trackCounts[i]])
  ) as Record<AudienceKey, number>

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
