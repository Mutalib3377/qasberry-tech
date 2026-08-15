// app/(marketing)/terms/page.tsx
// Terms of Use page — Qasberry design system.

import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { Footer } from '@/components/marketing/footer'
import { Badge } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Use | Qasberry',
  description: 'Terms and conditions governing the use of Qasberry AI learning platform and services.',
}

export default function TermsOfUsePage() {
  const lastUpdated = 'August 15, 2026'

  return (
    <div className="min-h-screen bg-brand-bg text-brand-charcoal flex flex-col">
      {/* Soft Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-500/8 blur-[120px]" />
      </div>

      <MarketingNav />

      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 pt-32 pb-20 w-full space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <Badge variant="primary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
            <FileText size={13} />
            Legal Agreement
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight">
            Terms of Use
          </h1>
          <p className="text-brand-tertiary text-sm font-medium">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content Card */}
        <Card className="p-8 sm:p-10 space-y-8 leading-relaxed text-brand-secondary text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Qasberry (&quot;Platform&quot;), you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">2. User Accounts & Responsibilities</h2>
            <p>
              To access certain features of the Platform, you must create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">3. Course Content & Intellectual Property</h2>
            <p>
              All course materials, video content, AI roadmaps, text, graphics, and code on Qasberry are the intellectual property of Qasberry or its content creators. You are granted a non-exclusive, non-transferable license to access and complete enrolled courses for personal, non-commercial educational purposes only.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may not redistribute, resell, or publicly share course materials without express permission.</li>
              <li>Certificates of completion are issued based on verified lesson completion.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">4. Payments, Refunds & Subscriptions</h2>
            <p>
              Certain courses or tracks require payment. All prices are listed in USD unless specified otherwise. Payment processing is managed securely via Stripe. Paid course enrollments grant lifetime access to the purchased material, subject to these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">5. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Platform for any illegal or unauthorized purpose.</li>
              <li>Attempt to scrape, reverse engineer, or exploit our AI roadmap features or API endpoints.</li>
              <li>Harass, abuse, or post inappropriate content within Qasberry Community Hubs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">6. Limitation of Liability</h2>
            <p>
              Qasberry is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee uninterrupted access or error-free operation. In no event shall Qasberry be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-brand-border">
            <h2 className="text-xl font-bold text-brand-charcoal">7. Contact Information</h2>
            <p>
              For any questions regarding these Terms of Use, please reach out to <a href="mailto:Qasberrytech@gmail.com" className="text-brand-purple font-semibold hover:underline">Qasberrytech@gmail.com</a>.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
