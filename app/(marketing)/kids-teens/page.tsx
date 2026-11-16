// app/(marketing)/kids-teens/page.tsx
// Qasberry Kids & Teens landing page — server component.
// Fetches published Kids & Teens courses from DB and passes them to client sub-components.

import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { YOUTH_CAREER_SLUGS } from '@/lib/features'
import { getAgeGroupCounts } from '@/lib/age-group-counts'
import { MarketingShell }         from '@/components/marketing/marketing-shell'
import { KidsHero }               from '@/components/kids/kids-hero'
import { KidsAgeBands }           from '@/components/kids/kids-age-bands'
import { KidsPathways }           from '@/components/kids/kids-pathways'
import { KidsJourney }            from '@/components/kids/kids-journey'
import { KidsTopics }             from '@/components/kids/kids-topics'
import { KidsTeacherResources }   from '@/components/kids/kids-teacher-resources'
import { KidsWhy }                from '@/components/kids/kids-why'
import { KidsYouTube }            from '@/components/kids/kids-youtube'
import { KidsTestimonials }       from '@/components/kids/kids-testimonials'
import { KidsFaq }                from '@/components/kids/kids-faq'
import { KidsCta }                from '@/components/kids/kids-cta'

export const metadata: Metadata = {
  // absolute: already branded, so skip the root '%s | Qasberry' template
  title: { absolute: 'Qasberry Kids & Teens — AI Learning for Children & Educators' },
  description:
    'Introduce children to Artificial Intelligence through fun, interactive lessons. Qasberry Kids & Teens delivers age-appropriate AI education for learners aged 6–16 and provides teachers with everything they need to bring AI into the classroom.',
  keywords: ['AI for youth', 'AI for kids', 'AI education children', 'youth AI learning', 'AI for teens', 'AI classroom', 'teach AI', 'Qasberry Kids & Teens'],
  openGraph: {
    title: 'Qasberry Kids & Teens — Learn AI Young. Build the Future.',
    description: 'Fun, structured AI learning for children — plus teacher resources, lesson plans, and a free YouTube channel.',
    type: 'website',
  },
}

export default async function KidsTeensPage() {
  // Fetch published courses in the Kids & Teens career category (see YOUTH_CAREER_SLUGS)
  const [courses, ageCounts] = await Promise.all([db.course.findMany({
    where:   { status: 'PUBLISHED', career: { slug: { in: [...YOUTH_CAREER_SLUGS] } } },
    orderBy: { createdAt: 'asc' },
    select: {
      id:          true,
      title:       true,
      slug:        true,
      description: true,
      thumbnail:   true,
      isFree:      true,
      price:       true,
    },
  }), getAgeGroupCounts()])

  // Normalise Decimal → number for client components
  const normalisedCourses = courses.map((c) => ({
    ...c,
    price: Number(c.price),
  }))

  return (
    <MarketingShell width="full">
      <KidsHero />
      <KidsAgeBands counts={ageCounts} />
      <KidsPathways />
      <KidsJourney />
      <KidsTopics courses={normalisedCourses} />
      <KidsTeacherResources />
      <KidsWhy />
      <KidsYouTube />
      <KidsTestimonials />
      <KidsFaq />
      <KidsCta />
    </MarketingShell>
  )
}
