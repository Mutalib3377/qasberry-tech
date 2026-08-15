// app/community/page.tsx
// Community Gallery page — unified light design system.

import { db } from '@/lib/db'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { Footer } from '@/components/marketing/footer'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Users, MessageSquare, ArrowRight, Zap } from 'lucide-react'

export const metadata = {
  title: 'Community Hubs | Qasberry',
  description: 'Connect with peers, share knowledge, and grow together in our career-specific AI communities.',
}

export default async function CommunityGalleryPage() {
  const communities = await db.community.findMany({
    include: {
      career: true,
      _count: {
        select: { members: true, posts: true }
      }
    },
    orderBy: { career: { name: 'asc' } }
  })

  return (
    <div className="min-h-screen bg-brand-bg text-brand-charcoal flex flex-col">
      <MarketingNav />

      <main className="relative z-10 flex-1 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="primary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
            Network & Grow
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-charcoal">
            Qasberry Community Hubs
          </h1>
          <p className="text-brand-secondary max-w-2xl mx-auto text-lg leading-relaxed">
            Join a specialized community built for your career path. 
            Connect directly with peers leveraging AI in your industry.
          </p>
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Link 
              key={community.id}
              href={`/community/${community.slug}`}
              className="group flex flex-col"
            >
              <Card variant="interactive" className="h-full flex flex-col justify-between p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-purple">
                        {community.career.name}
                      </span>
                      <h3 className="text-xl font-bold text-brand-charcoal group-hover:text-brand-purple transition-colors">
                        {community.name}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-brand-purple-soft flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-colors flex-shrink-0">
                      <ArrowRight size={16} className="rotate-[-45deg] group-hover:rotate-0 transition-transform" />
                    </div>
                  </div>

                  <p className="text-sm text-brand-secondary line-clamp-2 leading-relaxed">
                    {community.description || `Connect with ${community.career.name.toLowerCase()} experts and enthusiasts in this dedicated hub.`}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border-subtle flex items-center gap-4 text-xs font-semibold text-brand-tertiary">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border-subtle">
                    <Users size={13} className="text-brand-purple" />
                    {community._count.members} Members
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border-subtle">
                    <MessageSquare size={13} className="text-brand-purple" />
                    {community._count.posts} Posts
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
