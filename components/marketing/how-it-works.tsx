// components/marketing/how-it-works.tsx
// Three-step sequence in the dark robotics theme. A connector line draws
// itself across the steps as the section scrolls into view (GSAP scrub).
'use client'

import { useLayoutEffect, useRef } from 'react'
import { Compass, Layers, Trophy } from 'lucide-react'
import { gsap } from './robotics/gsap'
import { useReveal } from './robotics/use-reveal'
import { GlowCard, SectionHeading } from './robotics/ui'

const STEPS = [
  {
    number: '01',
    title: 'Pick a Course',
    body: 'Browse fun, age-appropriate AI courses and choose where to start.',
    icon: Compass,
  },
  {
    number: '02',
    title: 'Learn by Doing',
    body: 'Work through short lessons, quizzes and hands-on projects at your own pace.',
    icon: Layers,
  },
  {
    number: '03',
    title: 'Show What You Can Do',
    body: 'Earn a certificate and use your new AI skills in class, at home and in your own projects.',
    icon: Trophy,
  },
]

export function HowItWorks() {
  const scope = useRef<HTMLElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  useReveal(scope)

  // Draw the connector line as the steps scroll into view
  useLayoutEffect(() => {
    const path = lineRef.current
    const section = scope.current
    if (!path || !section) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const length = path.getTotalLength()
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'center 45%',
          scrub: true,
        },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={scope} id="how" className="rx-bg relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          tag="How it works"
          title="From curious to confident in three steps."
          sub="A simple path with structure, practice and progress you can see."
        />

        <div className="relative mt-14">
          {/* Scroll-drawn connector (desktop only) */}
          <svg
            className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-[44px] hidden h-4 w-[66.8%] lg:block"
            viewBox="0 0 1000 16"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden
          >
            <path
              ref={lineRef}
              d="M0 8 H1000"
              stroke="url(#rx-step-line)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="rx-step-line" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                <stop style={{ stopColor: 'var(--rx-grad-1)' }} />
                <stop offset="0.5" style={{ stopColor: 'var(--rx-grad-2)' }} />
                <stop offset="1" style={{ stopColor: 'var(--rx-grad-3)' }} />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.number} data-reveal data-reveal-delay={`${index * 0.1}`}>
                  <GlowCard className="relative h-full rounded-[26px] p-6 sm:p-7">
                    <div className="absolute -top-3 right-6 rounded-full border border-rx-line-strong bg-rx-sheet px-3 py-1 font-hud text-[10px] uppercase tracking-[0.18em] text-rx-muted">
                      Step {step.number}
                    </div>

                    <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-rx-cyan-line bg-rx-cyan-tint text-rx-cyan-ink">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-rx-text">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-rx-muted sm:text-base">{step.body}</p>

                    <div className="mt-6 h-1 overflow-hidden rounded-full bg-rx-line">
                      <div className="h-full w-full origin-left rounded-full rx-grad-bar" />
                    </div>
                  </GlowCard>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
