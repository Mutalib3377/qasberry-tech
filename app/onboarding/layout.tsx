// app/onboarding/layout.tsx
// MVP: the professional AI roadmap bot is hidden. The page and its API stay
// in place — switch SHOW_CAREER_ROADMAP back on in lib/features.ts.

import { redirect } from 'next/navigation'
import { SHOW_CAREER_ROADMAP } from '@/lib/features'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  if (!SHOW_CAREER_ROADMAP) redirect('/youth')
  return <>{children}</>
}
