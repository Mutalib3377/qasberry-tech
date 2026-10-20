'use client'
// components/shared/user-menu.tsx
// Clerk UserButton with quick links to the main signed-in destinations,
// so learners can jump anywhere from the avatar menu on every page.

import { UserButton } from '@clerk/nextjs'
import { BookOpen, LayoutDashboard, Users } from 'lucide-react'

export function UserMenu() {
  return (
    <UserButton afterSignOutUrl="/">
      <UserButton.MenuItems>
        <UserButton.Link label="Dashboard" labelIcon={<LayoutDashboard size={15} />} href="/dashboard" />
        <UserButton.Link label="Browse courses" labelIcon={<BookOpen size={15} />} href="/courses" />
        <UserButton.Link label="Community" labelIcon={<Users size={15} />} href="/community" />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  )
}
