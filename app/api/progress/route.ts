// app/api/progress/route.ts
// POST — mark a lesson complete. Creates a Progress record.
// After marking, checks if ALL lessons in the course are complete → issues certificate.
// POST body: { lessonId: string; courseId: string }

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db }   from '@/lib/db'
import { z }    from 'zod'
import { markLessonComplete, getCourseCompletionCounts } from '@/lib/completion'
import type { ApiResponse } from '@/types'

const BodySchema = z.object({
  lessonId: z.string().min(1),
  courseId: z.string().min(1),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = BodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request' }, { status: 400 })
  }

  const { lessonId, courseId } = parsed.data

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 })
  }

  // Verify the user is enrolled in the course
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })
  if (!enrollment) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Not enrolled' }, { status: 403 })
  }

  // A quiz lesson's Progress row must only ever be created by a passing quiz
  // attempt (app/api/quizzes/[quizId]/attempts/route.ts), never by a direct
  // "Mark Complete" call. This is an integrity/security rule, not a
  // completion-rule change — it applies unconditionally, regardless of the
  // ENABLE_QUIZ_COMPLETION_GATING flag, and is a no-op today since no
  // production lesson has type = 'QUIZ' yet.
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { type: true } })
  if (lesson?.type === 'QUIZ') {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Quiz lessons are completed by submitting a passing quiz attempt, not marked complete directly.' },
      { status: 403 }
    )
  }

  const result = await markLessonComplete(user.id, lessonId)

  return NextResponse.json({
    success: true,
    data: {
      completed:  result.completed,
      total:      result.total,
      certificateIssued: result.certificateCreated,
    },
  })
}

// GET — fetch progress for a course (array of completed lessonIds)
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const courseId = req.nextUrl.searchParams.get('courseId')
  if (!courseId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'courseId required' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'User not found' }, { status: 404 })
  }

  // completedLessonIds still spans *every* lesson — the sidebar needs a
  // checkmark on a completed optional lesson too. Only `total` (the progress
  // bar's denominator) must match what actually gates the certificate, so it
  // comes from the shared helper markLessonComplete() uses, not a local count.
  const allLessons = await db.lesson.findMany({
    where:  { module: { courseId } },
    select: { id: true },
  })

  const progress = await db.progress.findMany({
    where: {
      userId:   user.id,
      lessonId: { in: allLessons.map((l) => l.id) },
    },
    select: { lessonId: true },
  })

  const { completed, total } = await getCourseCompletionCounts(user.id, courseId)

  return NextResponse.json({
    success: true,
    data: {
      completedLessonIds: progress.map((p) => p.lessonId),
      completed,
      total,
    },
  })
}
