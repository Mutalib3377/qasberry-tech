// app/api/learn/[courseId]/[lessonId]/document-url/route.ts
// Mints a short-lived signed URL for one lesson's PDF document.
// GET /api/learn/[courseId]/[lessonId]/document-url
//
// Reuses the exact same enrollment check as app/api/learn/[courseId]/route.ts
// and the P2 Mux playback-token route (lib/enrollment.ts) — only an enrolled
// user can ever receive a URL, and only for a lesson that actually belongs to
// that course and has a document.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireEnrolledUser } from '@/lib/enrollment'
import { createSignedDocumentUrl } from '@/lib/supabase-storage'
import type { ApiResponse } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
): Promise<NextResponse> {
  const check = await requireEnrolledUser(params.courseId)
  if (!check.ok) {
    return NextResponse.json<ApiResponse>({ success: false, error: check.error }, { status: check.status })
  }

  // Defense in depth: confirm the lesson actually belongs to this course.
  const lesson = await db.lesson.findFirst({
    where: { id: params.lessonId, module: { courseId: params.courseId } },
    select: { documentKey: true },
  })

  if (!lesson) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Lesson not found' }, { status: 404 })
  }
  if (!lesson.documentKey) {
    // This route only ever serves lessons with an in-app document — a
    // not-yet-migrated (pdfUrl-only) lesson has nothing to sign.
    return NextResponse.json<ApiResponse>({ success: false, error: 'This lesson has no document' }, { status: 404 })
  }

  const url = await createSignedDocumentUrl(lesson.documentKey)

  return NextResponse.json({ success: true, data: { url } })
}
