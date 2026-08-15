'use client'
// components/shared/Button.tsx
// Qasberry design system button — unified light-theme version.
// Uses class-variance-authority (cva) for type-safe variant management.
//
// Variants:  primary | secondary | soft | ghost | destructive
// Sizes:     sm | md | lg
// Props:     isLoading — shows spinner, disables interaction

import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import React from 'react'

// ── Variant definitions ────────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base styles — applied to every variant
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-xl',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none whitespace-nowrap',
  ].join(' '),
  {
    variants: {
      variant: {
        // Primary — filled indigo
        primary: [
          'bg-brand-purple text-white',
          'hover:bg-brand-purple-hover',
          'shadow-sm shadow-brand-purple/20',
          'hover:shadow-md hover:shadow-brand-purple/25',
          'active:scale-[0.98]',
        ].join(' '),

        // Secondary — white with border
        secondary: [
          'bg-white text-brand-charcoal border border-brand-border',
          'hover:bg-brand-surface hover:border-brand-border-active/40',
          'active:scale-[0.98]',
        ].join(' '),

        // Soft — indigo-tinted light fill
        soft: [
          'bg-brand-purple-soft text-brand-purple border border-brand-purple/15',
          'hover:bg-brand-purple-soft/80 hover:border-brand-purple/25',
          'active:scale-[0.98]',
        ].join(' '),

        // Ghost — transparent
        ghost: [
          'bg-transparent text-brand-secondary',
          'hover:bg-brand-surface hover:text-brand-charcoal',
          'active:scale-[0.98]',
        ].join(' '),

        // Destructive — red
        destructive: [
          'bg-brand-error text-white',
          'hover:bg-red-700',
          'shadow-sm shadow-red-600/20',
          'active:scale-[0.98]',
        ].join(' '),
      },

      size: {
        sm: 'h-9  px-4 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
)

// ── Props ──────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Button({
  className = '',
  variant,
  size,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${buttonVariants({ variant, size })} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}
