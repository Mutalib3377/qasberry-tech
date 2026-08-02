// app/(marketing)/kids/page.tsx
// Qasberry Kids landing page — server component.
// Fetches published Kid courses from DB and passes them to client sub-components.

import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { MarketingNav }           from '@/components/marketing/marketing-nav'
import { Footer }                 from '@/components/marketing/footer'
import { KidsHero }               from '@/components/kids/kids-hero'
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
  title: 'Qasberry Kids — AI Learning for Children & Educators',
  description:
    'Introduce children to Artificial Intelligence through fun, interactive lessons. Qasberry Kids delivers age-appropriate AI education for learners aged 6–16 and provides teachers with everything they need to bring AI into the classroom.',
  keywords: ['AI for kids', 'AI education children', 'kids AI learning', 'AI classroom', 'teach AI', 'Qasberry Kids'],
  openGraph: {
    title: 'Qasberry Kids — Learn AI Young. Build the Future.',
    description: 'Fun, structured AI learning for children — plus teacher resources, lesson plans, and a free YouTube channel.',
    type: 'website',
  },
}

export default async function KidsPage() {
  // Fetch published courses in the Kids (slug: 'kid') career category
  const kidsCareer = await db.career.findUnique({ where: { slug: 'kid' } })

  const courses = kidsCareer
    ? await db.course.findMany({
        where:   { careerId: kidsCareer.id, status: 'PUBLISHED' },
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
      })
    : []

  // Normalise Decimal → number for client components
  const normalisedCourses = courses.map((c) => ({
    ...c,
    price: Number(c.price),
  }))

  return (
    <div className="min-h-screen bg-white text-[#101114] overflow-x-hidden">
      <MarketingNav />

      <main>
        <KidsHero />
        <KidsPathways />
        <KidsJourney />
        <KidsTopics courses={normalisedCourses} />
        <KidsTeacherResources />
        <KidsWhy />
        <KidsYouTube />
        <KidsTestimonials />
        <KidsFaq />
        <KidsCta />
      </main>

      <Footer />
    </div>
  )
}
