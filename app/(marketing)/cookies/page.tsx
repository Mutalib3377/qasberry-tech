// app/(marketing)/cookies/page.tsx
// Cookie Policy page — Qasberry design system.

import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { Footer } from '@/components/marketing/footer'
import { Badge } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import { Cookie } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | Qasberry',
  description: 'Understand how Qasberry uses cookies and similar technologies to enhance your learning experience.',
}

export default function CookiePolicyPage() {
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
            <Cookie size={13} />
            Data Preference
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-brand-tertiary text-sm font-medium">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content Card */}
        <Card className="p-8 sm:p-10 space-y-8 leading-relaxed text-brand-secondary text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your computer or mobile device when you visit a website. They allow the platform to recognize your device, remember your preferences, and keep you securely logged in during your learning session.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">2. Types of Cookies We Use</h2>
            <p>Qasberry uses the following categories of cookies:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Essential Cookies:</strong> Necessary for authentication, session security, and basic navigation (e.g., Clerk auth session cookies). Without these, key features like logging in or accessing dashboard courses will not function.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your choices, such as selected career tracks or dark/light mode preferences.
              </li>
              <li>
                <strong>Performance & Analytics Cookies:</strong> Help us understand how visitors interact with Qasberry, identifying popular career roadmaps and technical errors to continuously improve the product experience.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-brand-charcoal">3. Managing Your Cookie Preferences</h2>
            <p>
              You can control or disable cookies through your browser settings. Please note that disabling essential cookies may impact your ability to log in or complete lessons on Qasberry.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-brand-border">
            <h2 className="text-xl font-bold text-brand-charcoal">4. Questions & Support</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at <a href="mailto:Qasberrytech@gmail.com" className="text-brand-purple font-semibold hover:underline">Qasberrytech@gmail.com</a>.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
