// components/shared/StatCard.tsx
// Light-themed stat card for dashboard/admin overview sections.
// Renders an icon container + numeric value + label.

import React from 'react'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  /** Tailwind color class for the icon container bg, e.g. 'bg-brand-purple-soft' */
  iconBg?: string
  /** Tailwind color class for the icon itself, e.g. 'text-brand-purple' */
  iconColor?: string
  /** Optional trend indicator */
  trend?: { value: string; positive: boolean }
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  iconBg = 'bg-brand-purple-soft',
  iconColor = 'text-brand-purple',
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl border border-brand-border card-shadow',
        'p-5 flex items-center gap-4',
        className,
      ].join(' ')}
    >
      {/* Icon container */}
      <div
        className={[
          'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center',
          iconBg,
          iconColor,
        ].join(' ')}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-brand-charcoal leading-none tabular-nums">
          {value}
        </p>
        <p className="text-sm text-brand-secondary mt-0.5">{label}</p>
        {trend && (
          <p
            className={`text-xs mt-1 font-medium ${
              trend.positive ? 'text-brand-success' : 'text-brand-error'
            }`}
          >
            {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}
