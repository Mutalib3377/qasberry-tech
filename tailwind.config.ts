// tailwind.config.ts
// Qasberry Tailwind CSS configuration.
// Extends the default theme with the Inter font variable, design tokens,
// and animation utilities used across all phases.

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Maps to the CSS variable set by next/font/google in layout.tsx
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
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

        // ── Qasberry Unified Design Tokens ───────────────────────────────────
        // These are the single source of truth for all app pages.
        // Marketing page visual language → formalized here.
        brand: {
          // Primary interaction color — indigo
          purple:          '#5B5CF6', // primary buttons, links, active states
          'purple-hover':  '#4F46E5', // hover on primary elements
          'purple-active': '#4338CA', // pressed/active state
          'purple-dark':   '#4F46E5', // alias kept for backward compat
          'purple-light':  '#818CF8', // soft glow, focus rings
          'purple-soft':   '#EEF0FF', // pill backgrounds, badge fills
          'purple-subtle': '#F5F5FF', // very light tinted surfaces

          // Secondary accent — cyan/blue
          accent:          '#35C4E8', // progress bars, AI highlights
          'accent-soft':   '#EAFBFF', // light cyan backgrounds

          // Page backgrounds
          bg:              '#FCFCFD', // main app background
          surface:         '#F8F9FC', // section / card fill backgrounds
          'surface-muted': '#F2F4F8', // muted surfaces

          // Text hierarchy
          charcoal:        '#080B1C', // primary headings (was #1C1C1E)
          secondary:       '#53627A', // body text, descriptions
          tertiary:        '#71809A', // labels, metadata
          muted:           '#94A0B4', // placeholder, disabled text

          // Borders
          border:          '#E3E7EF', // default card/input borders
          'border-subtle': '#EDF0F5', // very light dividers
          'border-active': '#AEB3FF', // focused/active borders

          // Status colors (light mode)
          success:         '#16A34A',
          'success-bg':    '#ECFDF3',
          warning:         '#D97706',
          'warning-bg':    '#FFF7E8',
          error:           '#DC2626',
          'error-bg':      '#FEF2F2',
          info:            '#2563EB',
          'info-bg':       '#EFF6FF',

          // Legacy tokens kept for backward compatibility
          navy:            '#1A1040',
          lavender:        '#A89CEC',
          offwhite:        '#F8F9FC', // alias → brand-surface
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
