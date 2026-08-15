// components/shared/Card.tsx
// Qasberry design system card — light-theme, unified.
// Variants: default | featured | interactive | selected | muted
// Sub-components: CardHeader, CardTitle, CardFooter

import React from 'react'

export type CardVariant = 'default' | 'featured' | 'interactive' | 'selected' | 'muted'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant
  /** Removes default 24px padding — useful when card contains an image header */
  noPadding?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default:     'bg-white border border-brand-border card-shadow',
  featured:    'bg-gradient-to-br from-brand-purple-subtle to-white border border-brand-purple/15 card-shadow',
  interactive: 'bg-white border border-brand-border card-shadow hover:card-shadow-md hover:-translate-y-0.5 hover:border-brand-border-active/40 cursor-pointer transition-all duration-200',
  selected:    'bg-brand-purple-soft border border-brand-purple/30 card-shadow',
  muted:       'bg-brand-surface border border-brand-border-subtle',
}

export function Card({
  children,
  className = '',
  variant = 'default',
  noPadding = false,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl',
        variantStyles[variant],
        noPadding ? '' : 'p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`border-b border-brand-border pb-4 mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={`text-base font-semibold text-brand-charcoal ${className}`}>
      {children}
    </h3>
  )
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`border-t border-brand-border pt-4 mt-4 ${className}`}>
      {children}
    </div>
  )
}
