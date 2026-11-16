// components/marketing/robotics/ui.tsx
// Shared atoms for the robotics marketing theme. Colors come from the
// rx-* tokens, so everything here works in both light and dark.
'use client'

import { useCallback, useRef } from 'react'

/** Mono HUD label pill with a pulsing status dot */
export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-rx-line-strong bg-rx-chip px-4 py-2">
      <span className="rx-dot rx-pulse h-1.5 w-1.5 rounded-full" />
      <span className="rx-hud">{children}</span>
    </span>
  )
}

/** Centered section header: HUD tag + display heading + supporting copy */
export function SectionHeading({
  tag,
  title,
  sub,
}: {
  tag: string
  title: React.ReactNode
  sub?: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div data-reveal>
        <SectionTag>{tag}</SectionTag>
      </div>
      <h2
        data-reveal
        data-reveal-delay="0.08"
        className="mt-6 font-display text-3xl font-bold leading-[1.12] tracking-tight text-rx-text sm:text-[2.9rem]"
      >
        {title}
      </h2>
      {sub && (
        <p data-reveal data-reveal-delay="0.16" className="mt-5 text-base leading-relaxed text-rx-muted">
          {sub}
        </p>
      )}
    </div>
  )
}

/**
 * Glass card whose inner glow follows the pointer. Writes two CSS
 * variables on pointer move (no child transforms), inert on touch.
 */
export function GlowCard({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }, [])

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`rx-panel rx-panel-hover group relative overflow-hidden rounded-[24px] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), var(--rx-glow), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
