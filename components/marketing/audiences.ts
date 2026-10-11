// components/marketing/audiences.ts
// The two audiences Qasberry serves. Shared by the homepage hero, tracks
// section, nav and footer so the links and copy stay in one place.

import { Rocket, TrendingUp } from 'lucide-react'

export type AudienceKey = 'kids' | 'sales'

export const AUDIENCES = [
  {
    key: 'kids' as const,
    name: 'Kids & Youth',
    who: 'Ages 6–16',
    // Career slug(s) in the DB whose courses belong to this track
    careerSlugs: ['kid'],
    href: '/kids',
    tagline: 'Fun, safe AI lessons for young learners, plus resources for parents and teachers.',
    pitch:
      'Kids and teens learn how AI works by building with it: chatbots, stories, games and art. Lessons are short, playful and age-appropriate, with guides for parents and teachers.',
    outcomes: [
      'Understand how AI really works',
      'Build fun projects with AI tools',
      'Use AI safely and responsibly',
      'Think creatively and critically',
    ],
    level: 'Beginner',
    cta: 'Explore Kids & Youth',
    icon: Rocket,
    iconWrap: 'bg-violet-100 text-violet-700',
    accentText: 'text-violet-700',
    glow: 'bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_65%)]',
  },
  {
    key: 'sales' as const,
    name: 'Sales & Marketing',
    who: 'Professionals',
    careerSlugs: ['marketer'],
    href: '/sales-marketing',
    tagline: 'Use AI to find leads, write campaigns and close deals faster.',
    pitch:
      'For sales reps, marketers and founders who want AI to do the heavy lifting: prospect research, outreach, content, campaigns and reporting, with workflows you can use at work the same day.',
    outcomes: [
      'AI-powered prospecting & outreach',
      'Campaign and content creation',
      'CRM and follow-up automation',
      'Sharper insights from your data',
    ],
    level: 'Beginner–Pro',
    cta: 'Explore Sales & Marketing',
    icon: TrendingUp,
    iconWrap: 'bg-sky-100 text-sky-700',
    accentText: 'text-sky-700',
    glow: 'bg-[radial-gradient(circle,rgba(56,189,248,0.22),transparent_65%)]',
  },
]
