// components/marketing/robotics/use-reveal.ts
// Scroll-triggered reveal for marketing sections. Mark children with
// data-reveal (optionally data-reveal-delay="0.12") inside the scoped
// element and they fade/translate up once as they enter the viewport.
// Falls back to static visibility under prefers-reduced-motion.
'use client'

import { useLayoutEffect, type RefObject } from 'react'
import { gsap, EASE_OUT } from './gsap'

export function useReveal(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
      for (const target of targets) {
        gsap.fromTo(
          target,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: EASE_OUT,
            delay: parseFloat(target.dataset.revealDelay ?? '0'),
            scrollTrigger: { trigger: target, start: 'top 88%', once: true },
          }
        )
      }
    })

    return () => mm.revert()
  }, [scope])
}
