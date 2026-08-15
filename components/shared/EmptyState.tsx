// components/shared/EmptyState.tsx
// Light-themed empty state block.
// Used when a list/section has no content.
// Renders icon → heading → description → optional action.

import React from 'react'

interface EmptyStateProps {
  /** Lucide icon element */
  icon: React.ReactNode
  /** Short heading */
  heading: string
  /** Supporting sentence */
  description?: string
  /** Optional CTA */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  heading,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center text-center',
        'py-12 px-6',
        'bg-brand-surface rounded-2xl border border-brand-border',
        className,
      ].join(' ')}
    >
      {/* Icon container */}
      <div className="w-12 h-12 rounded-xl bg-brand-purple-soft flex items-center justify-center text-brand-purple mb-4">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-brand-charcoal">{heading}</h3>
      {description && (
        <p className="text-sm text-brand-secondary mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
