// app/(marketing)/privacy/page.tsx
// Privacy Policy page — Qasberry design system.

import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { Footer } from '@/components/marketing/footer'
import { Badge } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Qasberry',
  description: 'Learn how Qasberry collects, uses, and protects your personal information and learning data.',
}

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={13} />
            Legal & Trust
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-brand-tertiary text-sm font-medium">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content Card */}
        <Card className="p-8 sm:p-10 space-y-8 leading-relaxed text-brand-secondary text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">1. Introduction</h2>
            <p>
              Welcome to Qasberry (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website or use our AI learning platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">2. Information We Collect</h2>
            <p>We collect information that you voluntarily provide to us when registering, making purchases, or interacting with our AI features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, profile details provided via authentication providers (such as Clerk).</li>
              <li><strong>Learning & Progress Data:</strong> Enrolled career tracks, course progress, roadmap selections, quiz responses, and earned certificates.</li>
              <li><strong>Payment Information:</strong> Transaction history and billing details processed securely via our payment gateways (Stripe). We do not store raw card numbers.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, operating system, and usage analytics to improve platform performance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To build personalized AI learning roadmaps tailored to your career and goals.</li>
              <li>To provide, maintain, and optimize our learning management system and courses.</li>
              <li>To process payments and manage your subscriptions or course enrollments.</li>
              <li>To communicate important updates, course recommendations, and support responses.</li>
              <li>To enforce our terms, prevent fraudulent activity, and secure our infrastructure.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">4. Data Sharing & Third Parties</h2>
            <p>
              We do not sell your personal data. We only share information with trusted third-party service providers necessary to operate Qasberry (e.g., authentication, payment processors, cloud hosting, and AI model providers), all of which adhere to strict confidentiality and security standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">5. Children&apos;s Privacy</h2>
            <p>
              Our dedicated Qasberry Kids section is designed with safety as a top priority. We do not collect unnecessary personal information from children. Parents and educators maintain full control over child learning profiles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">6. Your Rights & Choices</h2>
            <p>
              Depending on your location, you have rights regarding your data, including the right to access, correct, export, or request deletion of your personal information. You can manage your profile settings or reach out to our team for assistance.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-brand-border">
            <h2 className="text-xl font-bold text-brand-charcoal">7. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please contact our support team at <a href="mailto:Qasberrytech@gmail.com" className="text-brand-purple font-semibold hover:underline">Qasberrytech@gmail.com</a>.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
