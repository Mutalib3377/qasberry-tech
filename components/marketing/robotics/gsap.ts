// components/marketing/robotics/gsap.ts
// Single place where GSAP plugins are registered for the marketing site.
// Import gsap from here, never from 'gsap' directly, so registration
// always happens first.
'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin)
}

// power4.out ≈ cubic-bezier(0.23, 1, 0.32, 1) — the strong ease-out used site-wide
export const EASE_OUT = 'power4.out'
export const EASE_IN_OUT = 'power3.inOut'

export { gsap, ScrollTrigger, SplitText }
