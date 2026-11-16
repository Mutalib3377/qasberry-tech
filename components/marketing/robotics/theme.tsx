// components/marketing/robotics/theme.tsx
// Light/dark state for the robotics homepage. <html data-rx-theme> is the
// single source of truth: CSS tokens, React UI and the Three.js scene all
// read it. The saved choice lives in localStorage; with no saved choice the
// theme follows the OS setting live.
'use client'

import { useLayoutEffect, useSyncExternalStore } from 'react'
import { RX_THEME_KEY } from './theme-script'

export type RxTheme = 'light' | 'dark'

const ATTR = 'data-rx-theme'

function readTheme(): RxTheme {
  return document.documentElement.getAttribute(ATTR) === 'light' ? 'light' : 'dark'
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [ATTR] })
  return () => observer.disconnect()
}

/** Current theme; re-renders when it changes. Server snapshot is dark. */
export function useRxTheme(): RxTheme {
  return useSyncExternalStore(subscribe, readTheme, () => 'dark')
}

function savedTheme(): RxTheme | null {
  try {
    const t = localStorage.getItem(RX_THEME_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function systemTheme(): RxTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/** Applies the theme on client-side navigation and tracks OS changes. */
export function RxThemeInit() {
  useLayoutEffect(() => {
    const root = document.documentElement
    root.setAttribute(ATTR, savedTheme() ?? systemTheme())

    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onSystemChange = () => {
      if (!savedTheme()) root.setAttribute(ATTR, systemTheme())
    }
    mq.addEventListener('change', onSystemChange)
    return () => mq.removeEventListener('change', onSystemChange)
  }, [])
  return null
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<void>
    finished: Promise<void>
  }
}

/**
 * Switches theme and saves the choice. With an origin point (the toggle's
 * center) and View Transitions support, the new theme is revealed as a
 * circle expanding from that point; otherwise it switches instantly.
 */
export function setRxTheme(next: RxTheme, origin?: { x: number; y: number }) {
  const root = document.documentElement
  const commit = () => {
    root.setAttribute(ATTR, next)
    try {
      localStorage.setItem(RX_THEME_KEY, next)
    } catch {
      // Storage blocked (private mode) — theme still applies for this visit
    }
  }

  const doc = document as ViewTransitionDoc
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!origin || reduce || typeof doc.startViewTransition !== 'function') {
    commit()
    return
  }

  root.classList.add('rx-vt')
  const transition = doc.startViewTransition(commit)
  transition.ready
    .then(() => {
      const { x, y } = origin
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 650,
          easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    })
    .catch(() => {})
  transition.finished.finally(() => root.classList.remove('rx-vt'))
}
