// Hides the community feature while SHOW_COMMUNITY is off (see lib/features.ts).
import { notFound } from 'next/navigation'
import { SHOW_COMMUNITY } from '@/lib/features'

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  if (!SHOW_COMMUNITY) notFound()
  return <>{children}</>
}
