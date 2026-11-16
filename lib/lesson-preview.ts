// lib/lesson-preview.ts
// Builds the public "Free preview" items for a course page. Server-only: it
// signs Mux tokens and converts raw share links, so neither a signing key nor
// an original pasted URL ever reaches the browser.
//
// Only lessons an admin explicitly marked isFree are included — that flag is
// the entitlement check for unauthenticated playback (the enrolled-only
// playback-token API is unchanged).

import 'server-only'
import type { Lesson } from '@prisma/client'
import { createPlaybackToken } from '@/lib/mux'
import { getEmbedUrl } from '@/lib/video-embed'
import type { PreviewItem } from '@/components/course/lesson-preview-player'

const MAX_PREVIEWS = 3

function durationLabel(seconds: number | null): string | undefined {
  if (!seconds) return undefined
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

type PreviewSource = Pick<Lesson, 'id' | 'title' | 'type' | 'isFree' | 'muxPlaybackId' | 'videoUrl' | 'content' | 'duration'>

export function buildPreviewItems(lessons: PreviewSource[]): PreviewItem[] {
  const items: PreviewItem[] = []
  for (const lesson of lessons) {
    if (!lesson.isFree || items.length >= MAX_PREVIEWS) continue
    const base = { id: lesson.id, title: lesson.title, durationLabel: durationLabel(lesson.duration) }

    if (lesson.type === 'VIDEO' && lesson.muxPlaybackId) {
      items.push({ ...base, kind: 'mux', playbackId: lesson.muxPlaybackId, token: createPlaybackToken(lesson.muxPlaybackId, 'public-preview') })
    } else if (lesson.type === 'VIDEO' && lesson.videoUrl) {
      const embedUrl = getEmbedUrl(lesson.videoUrl)
      if (embedUrl) items.push({ ...base, kind: 'embed', embedUrl })
    } else if (lesson.type === 'READING' && lesson.content) {
      items.push({ ...base, kind: 'reading', content: lesson.content })
    }
    // Quizzes aren't previewable here — their answers are graded server-side
  }
  return items
}
