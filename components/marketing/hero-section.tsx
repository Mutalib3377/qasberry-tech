// components/marketing/hero-section.tsx
// Robotics-theme hero: full-bleed Three.js scene (GLSL backdrop + QasBot),
// GSAP SplitText headline, scramble-text HUD line, magnetic CTAs and a
// scroll-scrubbed parallax exit. The 3D robot renders on wide viewports;
// phones keep the shader backdrop and particles only.
'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs'
import { ArrowDown, ArrowRight, FileBadge, GraduationCap, ChartNoAxesColumnIncreasing, Search } from 'lucide-react'
import { gsap, SplitText, EASE_OUT } from './robotics/gsap'

const RobotScene = dynamic(() => import('./robotics/robot-scene'), {
  ssr: false,
  loading: () => null,
})

const BENEFITS = [
  { label: 'Learn with AI', icon: GraduationCap },
  { label: 'Build Skills', icon: ChartNoAxesColumnIncreasing },
  { label: 'Get Certified', icon: FileBadge },
]

/** Wraps a CTA so it leans a few px toward a fine pointer, springs back on leave. */
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      gsap.to(el, { x: x * 0.18, y: y * 0.3, duration: 0.4, ease: EASE_OUT })
    }
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)' })
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <div ref={ref}>{children}</div>
}

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(true)
  const [reduced, setReduced] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const hudRef = useRef<HTMLSpanElement>(null)

  // Respect prefers-reduced-motion in the 3D scene too
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Pause the 3D render loop entirely once the hero scrolls out of view
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Intro timeline + scroll-scrubbed parallax exit
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // HUD scramble-in
      if (hudRef.current) {
        gsap.to(hudRef.current, {
          duration: 1.6,
          delay: 0.2,
          scrambleText: {
            text: 'QASBERRY // AI ACADEMY FOR YOUTH — SYSTEMS ONLINE',
            chars: '01<>/#_▮',
            speed: 0.4,
          },
        })
      }

      // Headline line 1: split into characters, rise in with stagger.
      // Line 2 keeps background-clip gradient text, which SplitText would
      // break per-character — so it reveals as one masked block instead.
      let split: SplitText | undefined
      if (line1Ref.current) {
        split = new SplitText(line1Ref.current, { type: 'chars,words' })
        gsap.from(split.chars, {
          yPercent: 110,
          autoAlpha: 0,
          rotateX: -45,
          duration: 0.9,
          ease: EASE_OUT,
          stagger: 0.03,
          delay: 0.25,
        })
      }
      if (line2Ref.current) {
        gsap.from(line2Ref.current, {
          yPercent: 112,
          duration: 1.0,
          ease: EASE_OUT,
          delay: 0.55,
        })
      }

      // Everything else fades up after the headline lands
      gsap.from(section.querySelectorAll('[data-hero-fade]'), {
        autoAlpha: 0,
        y: 24,
        duration: 0.8,
        ease: EASE_OUT,
        stagger: 0.09,
        delay: 0.75,
      })

      // Parallax exit: content drifts up and dims as the hero scrolls away
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          yPercent: -10,
          autoAlpha: 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom 30%',
            scrub: true,
          },
        })
      }

      return () => split?.revert()
    })

    return () => mm.revert()
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses')
  }

  function scrollToContent() {
    const next = sectionRef.current?.nextElementSibling
    if (!next) return
    const NAV_OFFSET = 48
    window.scrollTo({
      top: next.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  return (
    <section
      ref={sectionRef}
      className="rx-bg rx-noise relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* 3D layer */}
      <div className="absolute inset-0" aria-hidden>
        <RobotScene active={active} reduced={reduced} />
      </div>

      {/* Readability gradient over the canvas on small screens */}
      <div className="rx-hero-overlay pointer-events-none absolute inset-0 lg:hidden" aria-hidden />

      {/* Blend the hero's bottom edge into the next section */}
      <div className="rx-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 h-32" aria-hidden />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-24 pt-32 sm:px-8 sm:pt-36"
      >
        <div className="max-w-[640px]">
          <span ref={hudRef} className="rx-hud rx-hud-accent inline-block min-h-[1.2em]">
            {reduced ? 'QASBERRY // AI ACADEMY FOR YOUTH — SYSTEMS ONLINE' : '▮'}
          </span>

          <h1 className="mt-5 font-display text-[2.9rem] font-bold leading-[1.06] tracking-[-0.03em] text-rx-text sm:text-6xl lg:text-[4.6rem] [perspective:600px]">
            <span ref={line1Ref} className="block">
              Learn AI.
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <span ref={line2Ref} className="rx-gradient-text block will-change-transform">
                Build the future.
              </span>
            </span>
          </h1>

          <p data-hero-fade className="mt-6 max-w-[480px] text-base leading-relaxed text-rx-body sm:text-lg">
            Fun, safe AI courses for young learners — short lessons, real projects
            and certificates, with guides for parents and teachers.
          </p>

          {/* CTAs */}
          <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rx-cta group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl px-7 py-4 text-[15px] font-semibold">
                    Start learning free
                    <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/courses"
                  className="rx-cta group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl px-7 py-4 text-[15px] font-semibold"
                >
                  Continue learning
                  <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </SignedIn>
            </Magnetic>
            <Magnetic>
              <Link
                href="/kids-teens"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-rx-line-strong bg-rx-chip-strong px-7 py-4 text-[15px] font-semibold text-rx-text-2 backdrop-blur-sm transition-colors duration-300 hover:border-rx-line-hover hover:text-rx-text"
              >
                Explore Kids &amp; Teens
              </Link>
            </Magnetic>
          </div>

          {/* Command-bar search */}
          <form
            data-hero-fade
            onSubmit={handleSearch}
            className="mt-8 flex max-w-[480px] items-center gap-3 rounded-2xl border border-rx-line-strong bg-rx-chip-strong py-2 pl-4 pr-2 backdrop-blur-md transition-colors duration-300 focus-within:border-rx-line-hover"
          >
            <Search size={17} className="shrink-0 text-rx-dim" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search: AI art, chatbots, coding games…"
              aria-label="Search courses"
              className="min-w-0 flex-1 bg-transparent font-hud text-[13px] text-rx-text outline-none placeholder:text-rx-dim"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rx-cyan-tint text-rx-cyan-ink transition-colors duration-200 hover:bg-rx-cyan-line"
            >
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Benefit chips */}
          <ul data-hero-fade className="mt-9 flex flex-wrap items-center gap-3">
            {BENEFITS.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-full border border-rx-line bg-rx-chip px-4 py-2"
              >
                <Icon size={15} className="text-rx-violet-ink" />
                <span className="font-hud text-[11px] uppercase tracking-[0.14em] text-rx-body">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scroll cue */}
      <button
        type="button"
        onClick={scrollToContent}
        data-hero-fade
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 rounded-xl px-3 py-1.5 text-rx-dim transition-colors duration-200 hover:text-rx-cyan-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rx-cyan-line"
      >
        <span className="rx-hud">Scroll</span>
        <span className="motion-safe:animate-bounce">
          <ArrowDown size={15} />
        </span>
      </button>
    </section>
  )
}
