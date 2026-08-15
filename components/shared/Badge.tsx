// components/shared/Badge.tsx
// Qasberry design system badge/pill — light-theme, unified.
// Supports two modes:
//   1. status prop — legacy status-string-based coloring
//   2. variant prop — explicit semantic variant

import React from 'react'

// ── Status-string mapping (legacy / admin) ─────────────────────────────────────

const statusStyles: Record<string, string> = {
  // Content status
  Published:        'bg-brand-success-bg  text-brand-success  border-green-200',
  Draft:            'bg-brand-warning-bg  text-brand-warning  border-amber-200',

  // Pricing
  Free:             'bg-brand-info-bg     text-brand-info     border-blue-200',
  Paid:             'bg-brand-purple-soft text-brand-purple   border-brand-purple/20',

  // Role badges
  SUPER_ADMIN:      'bg-brand-error-bg    text-brand-error    border-red-200',
  ADMIN:            'bg-orange-50         text-orange-700     border-orange-200',
  INSTRUCTOR:       'bg-brand-info-bg     text-brand-info     border-blue-200',
  STUDENT:          'bg-brand-surface     text-brand-secondary border-brand-border',

  // Difficulty
  Beginner:         'bg-brand-success-bg  text-brand-success  border-green-200',
  Intermediate:     'bg-brand-warning-bg  text-brand-warning  border-amber-200',
  Advanced:         'bg-brand-error-bg    text-brand-error    border-red-200',
}

// ── Explicit variants ──────────────────────────────────────────────────────────

const variantStyles = {
  default:  'bg-brand-surface  text-brand-secondary border-brand-border',
  primary:  'bg-brand-purple-soft text-brand-purple border-brand-purple/20',
  success:  'bg-brand-success-bg  text-brand-success  border-green-200',
  warning:  'bg-brand-warning-bg  text-brand-warning  border-amber-200',
  error:    'bg-brand-error-bg    text-brand-error    border-red-200',
  info:     'bg-brand-info-bg     text-brand-info     border-blue-200',
}

const defaultStyle = 'bg-brand-surface text-brand-secondary border-brand-border'

export interface BadgeProps {
  status?: string
  variant?: keyof typeof variantStyles
  children?: React.ReactNode
  className?: string
}

export function Badge({ status, variant, children, className = '' }: BadgeProps) {
  const styles = variant
    ? variantStyles[variant]
    : status
      ? (statusStyles[status] ?? defaultStyle)
      : defaultStyle

  return (
    <span
      className={[
        'inline-flex items-center gap-1',
        'px-2.5 py-0.5',
        'rounded-full',
        'text-xs font-medium',
        'border',
        'whitespace-nowrap',
        styles,
        className,
      ].join(' ')}
    >
      {children ?? status}
    </span>
  )
}
