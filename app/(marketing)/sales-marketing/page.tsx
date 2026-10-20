// app/(marketing)/sales-marketing/page.tsx
// Qasberry Sales & Marketing landing page — server component.
// Fetches published courses for the Sales & Marketing track and passes them
// to client sub-components.

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { ENABLED_TRACKS } from '@/lib/features'
import { stripMarkdown } from '@/components/shared/markdown'
import { AUDIENCES } from '@/components/marketing/audiences'
import { MarketingNav }   from '@/components/marketing/marketing-nav'
import { Footer }         from '@/components/marketing/footer'
import { SalesHero }      from '@/components/sales/sales-hero'
import { SalesAudience }  from '@/components/sales/sales-audience'
import { SalesPaths }     from '@/components/sales/sales-paths'
import { SalesShowcase }  from '@/components/sales/sales-showcase'
import { SalesCourses }   from '@/components/sales/sales-courses'
import { SalesBenefits }  from '@/components/sales/sales-benefits'
import { SalesFaq }       from '@/components/sales/sales-faq'
import { SalesCta }       from '@/components/sales/sales-cta'

export const metadata: Metadata = {
  title: 'Qasberry for Sales & Marketing — Turn AI Into Your Competitive Advantage',
  description:
    'Learn how to use AI to generate leads, automate campaigns, engage customers and make smarter marketing decisions. Practical, self-paced courses for sales and marketing professionals.',
  keywords: ['AI for sales', 'AI for marketing', 'AI sales training', 'AI marketing course', 'sales automation', 'Qasberry'],
  openGraph: {
    title: 'Qasberry for Sales & Marketing — Turn AI Into Your Competitive Advantage',
    description: 'Practical AI skills for lead generation, campaigns, customer engagement and analytics.',
    type: 'website',
  },
}

const SALES = AUDIENCES.find((a) => a.key === 'sales')!

export default async function SalesMarketingPage() {
  // MVP: track is hidden — switch it back on in lib/features.ts
  if (!ENABLED_TRACKS.includes('sales')) redirect('/youth')

  const courses = await db.course.findMany({
    where: { status: 'PUBLISHED', career: { slug: { in: SALES.careerSlugs } } },
    orderBy: { createdAt: 'asc' },
    select: {
      id:          true,
      title:       true,
      slug:        true,
      description: true,
      thumbnail:   true,
      isFree:      true,
      price:       true,
      modules:     { select: { _count: { select: { lessons: true } } } },
    },
  })

  // Normalise for client components: Decimal → number, markdown → plain text
  const normalisedCourses = courses.map(({ modules, description, price, ...c }) => ({
    ...c,
    price:       Number(price),
    summary:     description ? stripMarkdown(description) : null,
    lessonCount: modules.reduce((sum, m) => sum + m._count.lessons, 0),
  }))

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f8fd] text-[#101114]">
      {/* Ambient colour blobs behind the glass surfaces */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[900px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.28),transparent_65%)]" />
        <div className="absolute right-[-14%] top-[1500px] h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.24),transparent_65%)]" />
        <div className="absolute left-[-10%] top-[2600px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.22),transparent_65%)]" />
        <div className="absolute right-[-12%] top-[3600px] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.24),transparent_65%)]" />
        <div className="absolute left-[-8%] top-[4700px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.22),transparent_65%)]" />
      </div>

      <MarketingNav />

      <main className="relative">
        <SalesHero />
        <SalesAudience />
        <SalesPaths />
        <SalesShowcase />
        <SalesCourses courses={normalisedCourses} browseHref="/courses?career=marketer" />
        <SalesBenefits />
        <SalesFaq />
        <SalesCta />
      </main>

      <Footer />
    </div>
  )
}
