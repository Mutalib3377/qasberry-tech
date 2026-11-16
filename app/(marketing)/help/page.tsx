// app/(marketing)/help/page.tsx
// Help Center — FAQs for learners, parents and teachers, plus a contact
// card. Linked from the footer. Answers describe only what the platform
// does today; pricing is deliberately left out until the payment plan is set.

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown, LifeBuoy, Mail } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Badge } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import { SUPPORT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Answers to common questions from learners, parents and teachers using Qasberry.',
}

type Faq = { q: string; a: React.ReactNode }

const link = 'text-brand-purple font-semibold hover:underline'

const SECTIONS: { title: string; faqs: Faq[] }[] = [
  {
    title: 'Getting started',
    faqs: [
      {
        q: 'Who is Qasberry for?',
        a: 'Qasberry teaches AI to young learners aged 6 to 16, with support for the parents and teachers guiding them.',
      },
      {
        q: 'How do I create an account?',
        a: 'Select "Get started" at the top of any page and sign up with your email or a supported sign-in provider. It takes about a minute.',
      },
      {
        q: 'How do I find a course?',
        a: (
          <>
            Browse the full list on the <Link href="/courses" className={link}>Courses page</Link>, or use the search
            box on the homepage to look for a topic such as AI art, chatbots or coding games.
          </>
        ),
      },
    ],
  },
  {
    title: 'Learning on Qasberry',
    faqs: [
      {
        q: 'What does a lesson look like?',
        a: 'Courses are split into modules made of short lessons: videos, readings and quizzes. Learners build small projects along the way and can go at their own pace.',
      },
      {
        q: 'Can I try a lesson before enrolling?',
        a: 'Many courses include free preview lessons. Open any course from the Courses page and look for the "Free Previews" section.',
      },
      {
        q: 'Where can I see my progress?',
        a: (
          <>
            Your <Link href="/dashboard" className={link}>dashboard</Link> shows every course you&apos;re enrolled in,
            how many lessons you&apos;ve completed, and your certificates.
          </>
        ),
      },
    ],
  },
  {
    title: 'Certificates',
    faqs: [
      {
        q: 'How do I earn a certificate?',
        a: 'Complete every lesson in a course and a certificate of completion is issued automatically.',
      },
      {
        q: 'Where do I find my certificates?',
        a: (
          <>
            They&apos;re listed under <Link href="/dashboard?tab=certificates#certificates" className={link}>My Certificates</Link> on
            your dashboard.
          </>
        ),
      },
      {
        q: 'Can I share a certificate with a school or parent?',
        a: 'Yes. Every certificate has its own page that anyone with the link can view, so it can be shared or added to a school portfolio.',
      },
    ],
  },
  {
    title: 'For parents and teachers',
    faqs: [
      {
        q: 'Is Qasberry safe for children?',
        a: (
          <>
            Lessons are written to be age-appropriate, and online safety, privacy and responsible AI use are built into
            every learning path. Read how we handle personal information in our{' '}
            <Link href="/privacy" className={link}>Privacy Policy</Link>.
          </>
        ),
      },
      {
        q: 'Are there resources for teachers?',
        a: (
          <>
            Yes. See the teacher resources on the <Link href="/kids-teens#teacher-resources" className={link}>Kids &amp; Teens page</Link>,
            including lesson plans, slides, worksheets and classroom activities.
          </>
        ),
      },
      {
        q: 'Do learners need special software?',
        a: 'No. Qasberry runs in a modern web browser on a computer or tablet.',
      },
    ],
  },
]

function FaqItem({ q, a }: Faq) {
  return (
    <details className="group border-b border-brand-border last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-brand-charcoal transition-colors hover:text-brand-purple [&::-webkit-details-marker]:hidden">
        {q}
        <ChevronDown
          size={18}
          aria-hidden
          className="shrink-0 text-brand-tertiary transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="pb-5 pr-8 leading-relaxed text-brand-secondary">{a}</div>
    </details>
  )
}

export default function HelpPage() {
  return (
    <MarketingShell width="reading">
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <Badge variant="primary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
            <LifeBuoy size={13} />
            Help Center
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight">
            How can we help?
          </h1>
          <p className="max-w-2xl text-brand-secondary text-base leading-relaxed">
            Answers to the questions learners, parents and teachers ask most. Can&apos;t find what you need? Our team
            is one email away.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">{section.title}</h2>
            <Card className="px-6 sm:px-8">
              {section.faqs.map((faq) => (
                <FaqItem key={faq.q} {...faq} />
              ))}
            </Card>
          </section>
        ))}

        {/* Contact */}
        <Card className="p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-purple-soft text-brand-purple">
            <Mail size={22} />
          </span>
          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-bold text-brand-charcoal">Still need help?</h2>
            <p className="text-brand-secondary">Email our support team and we&apos;ll get back to you.</p>
          </div>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-purple px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-purple-hover"
          >
            <Mail size={16} />
            {SUPPORT_EMAIL}
          </a>
        </Card>
      </div>
    </MarketingShell>
  )
}
