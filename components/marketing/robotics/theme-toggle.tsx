// components/marketing/robotics/theme-toggle.tsx
// Sun/moon button for the robotics homepage. The icons cross-rotate on
// switch; the page itself is revealed by setRxTheme's circular transition.
'use client'

import { Moon, Sun } from 'lucide-react'
import { setRxTheme, useRxTheme } from './theme'

const ICON =
  'absolute transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useRxTheme()
  const isLight = theme === 'light'

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setRxTheme(isLight ? 'dark' : 'light', {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
      className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-rx-line-strong bg-rx-chip text-rx-text-2 transition-colors duration-200 hover:border-rx-line-hover hover:text-rx-text ${className}`}
    >
      <Sun
        size={17}
        className={`${ICON} ${isLight ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'}`}
      />
      <Moon
        size={17}
        className={`${ICON} ${isLight ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
      />
    </button>
  )
}
