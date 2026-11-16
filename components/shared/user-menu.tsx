'use client'
// components/shared/user-menu.tsx
// Clerk UserButton with quick links to the main signed-in destinations,
// so learners can jump anywhere from the avatar menu on every page, plus the
// Reading help switch (Listen buttons and larger icons; lib/reading-help.ts).

import { UserButton } from '@clerk/nextjs'
import { BookOpen, LayoutDashboard, Users, Volume2, VolumeX } from 'lucide-react'
import { SHOW_COMMUNITY } from '@/lib/features'
import { setReadingHelp, useReadingHelp } from '@/lib/reading-help'

export function UserMenu() {
  const readingHelp = useReadingHelp()

  return (
    <UserButton afterSignOutUrl="/">
      <UserButton.MenuItems>
        <UserButton.Link label="Dashboard" labelIcon={<LayoutDashboard size={15} />} href="/dashboard" />
        <UserButton.Link label="Browse courses" labelIcon={<BookOpen size={15} />} href="/courses" />
        {SHOW_COMMUNITY && (
          <UserButton.Link label="Community" labelIcon={<Users size={15} />} href="/community" />
        )}
        <UserButton.Action
          label={readingHelp ? 'Reading help: On' : 'Reading help: Off'}
          labelIcon={readingHelp ? <Volume2 size={15} /> : <VolumeX size={15} />}
          onClick={() => setReadingHelp(!readingHelp)}
        />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  )
}
