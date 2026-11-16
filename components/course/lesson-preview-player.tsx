'use client'
// components/course/lesson-preview-player.tsx
// Plays a course's free preview lessons on the public course page — no
// sign-in. Items are prepared server-side (app/(marketing)/courses/[slug]):
// Mux lessons arrive with a short-lived signed token, external videos as an
// embed-only URL, readings as markdown. Only lessons an admin marked as a
// free preview ever reach this component.

import { useState } from 'react'
import MuxPlayerReact from '@mux/mux-player-react'
import { BookOpen, Play } from 'lucide-react'
import { Markdown } from '@/components/shared/markdown'

export type PreviewItem = { id: string; title: string; durationLabel?: string } & (
  | { kind: 'mux'; playbackId: string; token: string }
  | { kind: 'embed'; embedUrl: string }
  | { kind: 'reading'; content: string }
)

function PreviewBody({ item }: { item: PreviewItem }) {
  if (item.kind === 'mux') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <MuxPlayerReact
          playbackId={item.playbackId}
          tokens={{ playback: item.token }}
          metadata={{ video_title: `Preview: ${item.title}` }}
          streamType="on-demand"
          accentColor="#6E5BFF"
          className="h-full w-full"
        />
      </div>
    )
  }
  if (item.kind === 'embed') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={item.embedUrl}
          title={`Preview: ${item.title}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }
  return (
    <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-rx-line bg-rx-chip-strong p-6 text-sm leading-relaxed text-brand-secondary">
      <Markdown>{item.content}</Markdown>
    </div>
  )
}

export function LessonPreviewPlayer({ items }: { items: PreviewItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id)
  const active = items.find((i) => i.id === activeId) ?? items[0]
  if (!active) return null

  return (
    <div className="space-y-3">
      <PreviewBody key={active.id} item={active} />

      {items.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Free preview lessons">
          {items.map((item) => {
            const selected = item.id === active.id
            const Icon = item.kind === 'reading' ? BookOpen : Play
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveId(item.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-brand-purple bg-brand-purple-soft text-brand-purple'
                    : 'border-rx-line bg-rx-chip-strong text-brand-secondary hover:border-rx-line-strong hover:text-brand-charcoal'
                }`}
              >
                <Icon size={14} />
                {item.title}
                {item.durationLabel && <span className="text-xs text-brand-tertiary">{item.durationLabel}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
