// app/api/learn/[courseId]/[lessonId]/playback-token/route.ts
// Mints a short-lived signed Mux playback token for one lesson's video.
// GET /api/learn/[courseId]/[lessonId]/playback-token
//
// Reuses the exact same enrollment check as app/api/learn/[courseId]/route.ts
// (lib/enrollment.ts) — only an enrolled user can ever receive a token, and
// only for a lesson that actually belongs to that course and has a Mux asset.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireEnrolledUser } from '@/lib/enrollment'
import { createPlaybackToken } from '@/lib/mux'
import type { ApiResponse } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
): Promise<NextResponse> {
  const check = await requireEnrolledUser(params.courseId)
  if (!check.ok) {
    return NextResponse.json<ApiResponse>({ success: false, error: check.error }, { status: check.status })
  }

  // Defense in depth: confirm the lesson actually belongs to this course,
  // not just that the requester is enrolled in *a* course.
  const lesson = await db.lesson.findFirst({
    where: { id: params.lessonId, module: { courseId: params.courseId } },
    select: { muxPlaybackId: true },
  })

  if (!lesson) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Lesson not found' }, { status: 404 })
  }
  if (!lesson.muxPlaybackId) {
    // This route only ever serves lessons with a real Mux asset — a
    // not-yet-migrated (videoUrl-only) lesson has nothing to sign.
    return NextResponse.json<ApiResponse>({ success: false, error: 'This lesson has no Mux video' }, { status: 404 })
  }

  const token = createPlaybackToken(lesson.muxPlaybackId, check.user.id)

  return NextResponse.json({ success: true, data: { token } })
}
