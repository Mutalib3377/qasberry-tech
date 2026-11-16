// tailwind.config.ts
// Qasberry Tailwind CSS configuration.
// Extends the default theme with the Inter font variable, design tokens,
// and animation utilities used across all phases.

import type { Config } from 'tailwindcss'

// Brand colors are CSS variables with the original value as fallback. Pages
// outside the robotics theme never set the variables, so they keep these
// exact colors; inside .rx-root (marketing pages) globals.css redefines them
// per light/dark theme. Channel format keeps opacity modifiers (/20) working.
const brand = (name: string, rgb: string) => `rgb(var(--brand-${name}, ${rgb}) / <alpha-value>)`

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // `dark:` utilities apply only on robotics-theme pages (.rx-root) while the
  // theme is dark — see components/marketing/robotics/theme.tsx. The rest of
  // the app has no dark mode, so they never fire there.
  darkMode: ['variant', ':root:not([data-rx-theme="light"]) .rx-root &'],
  theme: {
    extend: {
      fontFamily: {
        // Maps to the CSS variable set by next/font/google in layout.tsx
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Marketing (robotics theme) — set in app/(marketing)/layout.tsx
        display: ['var(--font-grotesk)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        hud: ['var(--font-jbmono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // ── Semantic CSS-variable tokens (existing) ──────────────────────────
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },

        // ── Robotics marketing theme (homepage) ─────────────────────────────
        // Values swap between dark and light via <html data-rx-theme> —
        // see the "rx-" token block in app/globals.css.
        rx: {
          bg:            'var(--rx-bg)',
          sheet:         'var(--rx-sheet)',
          chip:          'var(--rx-chip)',
          'chip-strong': 'var(--rx-chip-strong)',
          line:          'var(--rx-line)',
          'line-strong': 'var(--rx-line-strong)',
          'line-hover':  'var(--rx-line-hover)',
          text:          'var(--rx-text)',
          'text-2':      'var(--rx-text-2)',
          body:          'var(--rx-body)',
          muted:         'var(--rx-muted)',
          dim:           'var(--rx-dim)',
          faint:         'var(--rx-faint)',
          cyan:          'var(--rx-cyan)',
          'cyan-ink':    'var(--rx-cyan-ink)',
          'cyan-tint':   'var(--rx-cyan-tint)',
          'cyan-line':   'var(--rx-cyan-line)',
          violet:        'var(--rx-violet)',
          'violet-ink':  'var(--rx-violet-ink)',
          'violet-tint': 'var(--rx-violet-tint)',
          'violet-line': 'var(--rx-violet-line)',
        },

        // ── Qasberry Unified Design Tokens ───────────────────────────────────
        // These are the single source of truth for all app pages.
        // Marketing page visual language → formalized here.
        brand: {
          // Primary interaction color — indigo
          purple: brand('purple', '91 92 246'), // primary buttons, links, active states
          'purple-hover': brand('purple-hover', '79 70 229'), // hover on primary elements
          'purple-active': brand('purple-active', '67 56 202'), // pressed/active state
          'purple-dark': brand('purple-dark', '79 70 229'), // alias kept for backward compat
          'purple-light': brand('purple-light', '129 140 248'), // soft glow, focus rings
          'purple-soft': brand('purple-soft', '238 240 255'), // pill backgrounds, badge fills
          'purple-subtle': brand('purple-subtle', '245 245 255'), // very light tinted surfaces

          // Secondary accent — cyan/blue
          accent: brand('accent', '53 196 232'), // progress bars, AI highlights
          'accent-soft': brand('accent-soft', '234 251 255'), // light cyan backgrounds

          // Page backgrounds
          bg: brand('bg', '252 252 253'), // main app background
          surface: brand('surface', '248 249 252'), // section / card fill backgrounds
          'surface-muted': brand('surface-muted', '242 244 248'), // muted surfaces

          // Text hierarchy
          charcoal: brand('charcoal', '8 11 28'), // primary headings (was #1C1C1E)
          secondary: brand('secondary', '83 98 122'), // body text, descriptions
          tertiary: brand('tertiary', '113 128 154'), // labels, metadata
          muted: brand('muted', '148 160 180'), // placeholder, disabled text

          // Borders
          border: brand('border', '227 231 239'), // default card/input borders
          'border-subtle': brand('border-subtle', '237 240 245'), // very light dividers
          'border-active': brand('border-active', '174 179 255'), // focused/active borders

          // Status colors (light mode)
          success: brand('success', '22 163 74'),
          'success-bg': brand('success-bg', '236 253 243'),
          warning: brand('warning', '217 119 6'),
          'warning-bg': brand('warning-bg', '255 247 232'),
          error: brand('error', '220 38 38'),
          'error-bg': brand('error-bg', '254 242 242'),
          info: brand('info', '37 99 235'),
          'info-bg': brand('info-bg', '239 246 255'),

          // Legacy tokens kept for backward compatibility
          navy: brand('navy', '26 16 64'),
          lavender: brand('lavender', '168 156 236'),
          offwhite: brand('offwhite', '248 249 252'), // alias → brand-surface
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Design system scale
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        // Qasberry shadow scale — very subtle, lightweight feel
        'ds-sm':    '0 2px 8px rgba(15, 23, 42, 0.04)',
        'ds-md':    '0 8px 24px rgba(15, 23, 42, 0.06)',
        'ds-lg':    '0 16px 40px rgba(15, 23, 42, 0.08)',
        'ds-hover': '0 12px 32px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        // Used by the Qasberry bot floating animation (Phase 3)
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        // Gentle pulsing glow for the bot character
        glow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        // Staggered reveal for roadmap steps (Phase 3)
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Shimmer for loading skeletons
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
