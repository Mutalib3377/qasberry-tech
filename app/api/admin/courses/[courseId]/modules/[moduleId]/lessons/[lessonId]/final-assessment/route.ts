// app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/final-assessment/route.ts
// Admin API: flag a quiz lesson as the course's final assessment, or unflag one.
//
// A dedicated endpoint rather than letting the client PATCH isFinalAssessment
// directly (the general lesson PATCH route still accepts that field from P4,
// unchanged — this doesn't remove that): "move the flag from lesson A to
// lesson B" is a two-row, course-scoped, transactional operation, not a
// single-row field update. Same reasoning P3/P4 used for their own dedicated
// endpoints (document upload, quiz CRUD) — a fundamentally different shape
// from a flat PATCH, so it gets its own route.
//
// POST: unset isFinalAssessment on whichever lesson in this course currently
// has it (if any), then set it on this lesson — in that order, in one
// transaction, so the P1 trigger (enforce_single_final_assessment) only ever
// sees one `true` row at a time for this common "move it" case and never
// hits its conflict path. The trigger remains the safety net for a genuine
// race between two concurrent requests; if that happens, its exception is
// caught here and turned into a clear 409, not a raw 500.
//
// DELETE: unset isFinalAssessment on this lesson only, no replacement.

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import type { UserRole, ApiResponse } from '@/types'

const COURSE_MANAGER_ROLES: UserRole[] = ['SUPER_ADMIN', 'CONTENT_MANAGER']

type RouteContext = { params: { courseId: string; moduleId: string; lessonId: string } }

async function getUserRole(userId: string): Promise<UserRole | undefined> {
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  return (user.publicMetadata as { role?: UserRole })?.role
}

export async function POST(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !COURSE_MANAGER_ROLES.includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const lesson = await db.lesson.findUnique({ where: { id: params.lessonId }, select: { type: true } })
  if (!lesson) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Lesson not found' }, { status: 404 })
  }
  if (lesson.type !== 'QUIZ') {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Only a quiz lesson can be the final assessment' }, { status: 400 })
  }

  try {
    await db.$transaction(async (tx) => {
      // 1. Unset whoever currently has it in this course.
      await tx.lesson.updateMany({
        where: { module: { courseId: params.courseId }, isFinalAssessment: true },
        data: { isFinalAssessment: false },
      })
      // 2. Set it on the target lesson.
      await tx.lesson.update({
        where: { id: params.lessonId },
        data: { isFinalAssessment: true },
      })
    })

    return NextResponse.json({ success: true, data: { message: 'Final assessment updated' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // The P1 trigger's exception text — only reachable via a genuine race
    // between two concurrent requests, since step 1 above already clears
    // every other row before step 2 runs.
    if (message.includes('already has a final-assessment lesson')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Someone else just changed the final assessment — please retry.' },
        { status: 409 }
      )
    }
    console.error('POST final-assessment error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update final assessment' }, { status: 500 })
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
    await db.lesson.update({ where: { id: params.lessonId }, data: { isFinalAssessment: false } })
    return NextResponse.json({ success: true, data: { message: 'Final assessment unset' } })
  } catch (err) {
    console.error('DELETE final-assessment error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to unset final assessment' }, { status: 500 })
  }
}
