// components/marketing/cta-banner.tsx
// Final call to action in the dark robotics theme: glowing panel, orbiting
// decorative rings, and a GSAP count-up on the live course count.
'use client'

import Link from 'next/link'
import { useLayoutEffect, useRef } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import { gsap, EASE_OUT } from './robotics/gsap'
import { useReveal } from './robotics/use-reveal'

interface Props {
  courseCount: number
}

export function CtaBanner({ courseCount }: Props) {
  const scope = useRef<HTMLElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  useReveal(scope)

  // Count the course number up from 0 when the banner scrolls in
  useLayoutEffect(() => {
    const el = countRef.current
    if (!el || courseCount <= 0) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const state = { n: 0 }
      gsap.to(state, {
        n: courseCount,
        duration: 1.4,
        ease: EASE_OUT,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(state.n))
        },
      })
    })
    return () => mm.revert()
  }, [courseCount])

  return (
    <section ref={scope} id="pricing" className="rx-bg relative px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div
          data-reveal
          className="rx-panel relative overflow-hidden rounded-[32px] p-8 text-center sm:p-14"
        >
          {/* Glow + orbit décor */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full rx-cta-halo" />
            <div className="rx-orbit absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0 rounded-full border border-rx-line" />
              <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full rx-dot" />
            </div>
            <div className="rx-orbit absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 [animation-duration:38s] [animation-direction:reverse]">
              <div className="absolute inset-0 rounded-full border border-rx-line opacity-60" />
              <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full rx-dot-violet" />
            </div>
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-rx-line-strong bg-rx-chip-strong px-4 py-2">
              <span className="rx-pulse h-1.5 w-1.5 rounded-full rx-dot" />
              <span className="rx-hud">
                {courseCount > 0 ? (
                  <>
                    <span ref={countRef}>{courseCount}</span> course{courseCount !== 1 ? 's' : ''} online now
                  </>
                ) : (
                  'Launching soon'
                )}
              </span>
            </div>

            <h2 className="mx-auto mt-7 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-rx-text sm:text-5xl">
              Start learning AI today,
              <br className="hidden sm:block" /> and <span className="rx-gradient-text">build the future.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-rx-muted sm:text-lg">
              Help your child get ready for an AI-powered future with fun, safe lessons. Get started in minutes.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    id="cta-get-started-btn"
                    className="group inline-flex items-center gap-2.5 rounded-2xl rx-cta px-7 py-4 text-[15px] font-semibold sm:text-base"
                  >
                    Get started for free
                    <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/courses"
                  id="cta-roadmap-btn"
                  className="group inline-flex items-center gap-2.5 rounded-2xl rx-cta px-7 py-4 text-[15px] font-semibold sm:text-base"
                >
                  Browse courses
                  <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </SignedIn>
            </div>

            <p className="mt-6 font-hud text-[11px] uppercase tracking-[0.18em] text-rx-dim">
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
