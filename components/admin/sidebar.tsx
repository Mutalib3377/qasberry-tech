'use client'
// components/admin/sidebar.tsx
// Admin panel sidebar — unified light design system.

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  DollarSign,
  Settings,
} from 'lucide-react'
import type { UserRole } from '@/types'
import { Badge } from '@/components/shared/Badge'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Courses',
    href: '/admin/courses',
    icon: <BookOpen size={18} />,
    roles: ['SUPER_ADMIN', 'CONTENT_MANAGER'],
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: <Users size={18} />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Community',
    href: '/admin/community',
    icon: <MessageSquare size={18} />,
    roles: ['SUPER_ADMIN', 'MODERATOR'],
  },
  {
    label: 'Revenue',
    href: '/admin/revenue',
    icon: <DollarSign size={18} />,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: <Settings size={18} />,
    roles: ['SUPER_ADMIN'],
  },
]

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  CONTENT_MANAGER: 'Content Manager',
  MODERATOR: 'Moderator',
  STUDENT: 'Student',
}

interface SidebarProps {
  role: UserRole
}

export function AdminSidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  )

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col border-r border-brand-border bg-white z-40">
      {/* Logo Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Qasberry" width={150} height={38} className="h-8 w-auto" />
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-surface text-brand-tertiary border border-brand-border-subtle">
          Admin
        </span>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-brand-border-subtle bg-brand-surface/50">
        <Badge variant="primary" className="text-xs font-semibold">
          {ROLE_LABELS[role]}
        </Badge>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-brand-purple-soft text-brand-purple border border-brand-purple/20'
                  : 'text-brand-secondary hover:text-brand-charcoal hover:bg-brand-surface border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-brand-purple' : 'text-brand-tertiary'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-brand-border">
        <p className="text-xs text-brand-tertiary">Qasberry v0.2.0</p>
      </div>
    </aside>
  )
}
