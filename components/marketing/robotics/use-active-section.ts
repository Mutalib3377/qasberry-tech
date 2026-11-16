// components/marketing/robotics/use-active-section.ts
// Scroll-spy for in-page nav links: returns the id of the section crossing
// a thin band just above the middle of the viewport, or null when none is
// (e.g. between tracked sections, or in the hero).
'use client'

import { useEffect, useState } from 'react'

export function useActiveSection(ids: readonly string[], enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join(',')

  useEffect(() => {
    if (!enabled) {
      setActive(null)
      return
    }
    const sectionIds = key.split(',')
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const intersecting = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) intersecting.set(entry.target.id, entry.isIntersecting)
        setActive(sectionIds.find((id) => intersecting.get(id)) ?? null)
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key, enabled])

  return active
}
