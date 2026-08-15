// components/shared/PageHeader.tsx
// Consistent application page header block.
// Renders eyebrow label → h1 title → optional description → optional action.
// Used at the top of every main app page content area.

import React from 'react'

interface PageHeaderProps {
  /** Small uppercase label above the title */
  eyebrow?: string
  /** Main page title — rendered as h1 */
  title: string | React.ReactNode
  /** Short supporting description */
  description?: string | React.ReactNode
  /** Optional actions (e.g. a Button) rendered to the right of the title */
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 ${className}`}>
      <div className="space-y-1.5 max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-purple">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal leading-tight tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-brand-secondary leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 flex items-center">
          {action}
        </div>
      )}
    </div>
  )
}
