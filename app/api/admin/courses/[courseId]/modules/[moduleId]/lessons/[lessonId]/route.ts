// app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/route.ts
// Admin API: Update and delete a single lesson.

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { deleteMuxAsset } from '@/lib/mux'
import type { UserRole, ApiResponse } from '@/types'

const COURSE_MANAGER_ROLES: UserRole[] = ['SUPER_ADMIN', 'CONTENT_MANAGER']

const updateLessonSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  order: z.number().int().min(0).optional(),
  isFree: z.boolean().optional(),
  // External link fields — YouTube, Google Drive, Vimeo, etc.
  videoUrl: z.string().url().nullable().optional(),
  pdfUrl: z.string().url().nullable().optional(),
  // Plain markdown/text body for READING lessons with no PDF attached.
  content: z.string().nullable().optional(),
  // Legacy Mux fields (kept for backward-compat)
  muxAssetId: z.string().nullable().optional(),
  muxPlaybackId: z.string().nullable().optional(),
  duration: z.number().int().nullable().optional(),
  // Lesson type/completion-rule fields (P1 schema, P4 API support). Setting
  // isFinalAssessment: true here is what triggers the P1 Postgres trigger
  // (enforce_single_final_assessment) if another lesson in the course
  // already has it set — that 500-from-a-DB-exception is expected and
  // intentionally not caught/translated here.
  type: z.enum(['VIDEO', 'READING', 'QUIZ']).optional(),
  isRequired: z.boolean().optional(),
  isFinalAssessment: z.boolean().optional(),
})

type RouteContext = { params: { courseId: string; moduleId: string; lessonId: string } }

// Helper: read role from Clerk publicMetadata directly
async function getUserRole(userId: string): Promise<UserRole | undefined> {
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  return (user.publicMetadata as { role?: UserRole })?.role
}

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !COURSE_MANAGER_ROLES.includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateLessonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 }
    )
  }

  try {
    const lesson = await db.lesson.update({
      where: { id: params.lessonId },
      data: parsed.data,
    })
    return NextResponse.json({ success: true, data: lesson })
  } catch (err) {
    console.error('PATCH lesson error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update lesson' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !COURSE_MANAGER_ROLES.includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Look up the Mux asset (if any) before deleting the row, so we know
    // whether there's anything to clean up on Mux's side afterward.
    const lesson = await db.lesson.findUnique({
      where: { id: params.lessonId },
      select: { muxAssetId: true },
    })

    await db.lesson.delete({ where: { id: params.lessonId } })

    // Best-effort Mux cleanup — the DB delete above is the source of truth
    // and has already succeeded; a failure here only leaks a billable Mux
    // asset, it never blocks or reverts the lesson delete.
    if (lesson?.muxAssetId) {
      try {
        await deleteMuxAsset(lesson.muxAssetId)
        console.log(`✅ Deleted Mux asset ${lesson.muxAssetId} for removed lesson ${params.lessonId}`)
      } catch (muxErr) {
        console.error(`⚠️ Failed to delete Mux asset ${lesson.muxAssetId} for removed lesson ${params.lessonId} (non-fatal):`, muxErr)
      }
    }

    return NextResponse.json({ success: true, data: { message: 'Lesson deleted' } })
  } catch (err) {
    console.error('DELETE lesson error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to delete lesson' }, { status: 500 })
  }
}
