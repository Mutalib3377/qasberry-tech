// components/marketing/marketing-shell.tsx
// Shared frame for every marketing page: robotics theme (light/dark), nav,
// footer, spacing below the fixed nav, a fixed set of content widths and
// one page-entry animation. Pages pick a width instead of setting their own.

import { MarketingNav } from './marketing-nav'
import { Footer } from './footer'
import { RxThemeScript } from './robotics/theme-script'
import { RxThemeInit } from './robotics/theme'

const WIDTHS = {
  /** Catalog, course pages, grids — content edges line up with the nav */
  wide: 'max-w-7xl',
  /** Long-form reading: legal, help, community threads */
  reading: 'max-w-4xl',
} as const

export type ShellWidth = keyof typeof WIDTHS | 'full'

export function MarketingShell({
  width = 'wide',
  children,
}: {
  /** 'full' hands layout to the page's own full-bleed sections (homepage, Kids & Teens) */
  width?: ShellWidth
  children: React.ReactNode
}) {
  const full = width === 'full'

  return (
    <div className="rx-root relative flex min-h-screen flex-col overflow-x-hidden">
      <RxThemeScript />
      <RxThemeInit />

      {!full && (
        // Faint blueprint grid behind the top of inner pages
        <div className="rx-grid rx-grid-fade pointer-events-none absolute inset-x-0 top-0 h-[560px]" aria-hidden />
      )}

      <MarketingNav theme="robotics" />

      <main
        className={
          full
            ? 'rx-page-enter relative flex-1'
            : `rx-page-enter relative z-10 mx-auto w-full flex-1 px-5 pb-20 pt-32 sm:px-8 ${WIDTHS[width]}`
        }
      >
        {children}
      </main>

      <Footer theme="robotics" />
    </div>
  )
}
