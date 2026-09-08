// app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/quiz/route.ts
// Admin API: create, read, and update the quiz attached to a lesson.
//
// Separated from the general lesson PATCH route — same reasoning as the P3
// document upload route: a quiz has its own nested shape (questions,
// options) and its own side effects (linking lesson.quizId/type), not a fit
// for the flat lesson PATCH body.
//
// Security: only SUPER_ADMIN and CONTENT_MANAGER can create/read/update — same
// role-gate used by every other app/api/admin/ route. Option.isCorrect is
// freely readable here because this route is admin-only; it must never leak
// through the student-facing route (app/api/learn/[courseId]/route.ts).

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import type { UserRole, ApiResponse } from '@/types'

const COURSE_MANAGER_ROLES: UserRole[] = ['SUPER_ADMIN', 'CONTENT_MANAGER']

type RouteContext = { params: { courseId: string; moduleId: string; lessonId: string } }

// Helper: read role from Clerk publicMetadata directly (same as every other admin route)
async function getUserRole(userId: string): Promise<UserRole | undefined> {
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  return (user.publicMetadata as { role?: UserRole })?.role
}

// ─── Shared shape for both create and update ──────────────────────────────
// `id` is present on an option/question when the admin is editing an
// existing one; absent when adding a new one. Used only by PUT — POST always
// creates fresh rows and ignores any `id` a client might (incorrectly) send.

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Option text is required').max(500),
  order: z.number().int().min(0),
  isCorrect: z.boolean(),
})

const questionSchema = z
  .object({
    id: z.string().optional(),
    prompt: z.string().min(1, 'Question prompt is required').max(1000),
    order: z.number().int().min(0),
    points: z.number().int().min(1).default(1),
    options: z.array(optionSchema).min(2, 'Each question needs at least 2 options').max(4, 'Each question allows at most 4 options'),
  })
  .refine((q) => q.options.some((o) => o.isCorrect), {
    message: 'Each question needs at least one correct option',
    path: ['options'],
  })

const quizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(200),
  instructions: z.string().nullable().optional(),
  passingScore: z.number().int().min(0).max(100),
  maxAttempts: z.number().int().min(1).nullable().optional(),
  questions: z.array(questionSchema).min(1, 'A quiz needs at least one question'),
})

const quizWithOptions = {
  questions: {
    orderBy: { order: 'asc' as const },
    include: { options: { orderBy: { order: 'asc' as const } } },
  },
}

// ─── GET — fetch the quiz attached to this lesson (admin view, includes isCorrect) ──

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !(['SUPER_ADMIN', 'CONTENT_MANAGER', 'MODERATOR'] as UserRole[]).includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const lesson = await db.lesson.findUnique({ where: { id: params.lessonId }, select: { quizId: true } })
  if (!lesson) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Lesson not found' }, { status: 404 })
  }
  if (!lesson.quizId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'This lesson has no quiz yet' }, { status: 404 })
  }

  const quiz = await db.quiz.findUnique({ where: { id: lesson.quizId }, include: quizWithOptions })
  return NextResponse.json({ success: true, data: quiz })
}

// ─── POST — create a quiz for this lesson ─────────────────────────────────

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !COURSE_MANAGER_ROLES.includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const lesson = await db.lesson.findUnique({ where: { id: params.lessonId }, select: { id: true, quizId: true } })
  if (!lesson) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Lesson not found' }, { status: 404 })
  }
  if (lesson.quizId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'This lesson already has a quiz — use PUT to update it' },
      { status: 409 }
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = quizSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 }
    )
  }

  try {
    const quiz = await db.$transaction(async (tx) => {
      const created = await tx.quiz.create({
        data: {
          title: parsed.data.title,
          instructions: parsed.data.instructions ?? null,
          passingScore: parsed.data.passingScore,
          maxAttempts: parsed.data.maxAttempts ?? null,
          questions: {
            create: parsed.data.questions.map((q) => ({
              prompt: q.prompt,
              order: q.order,
              points: q.points,
              options: {
                create: q.options.map((o) => ({ text: o.text, order: o.order, isCorrect: o.isCorrect })),
              },
            })),
          },
        },
        include: quizWithOptions,
      })

      // A lesson with a quiz is definitionally a quiz lesson.
      await tx.lesson.update({
        where: { id: params.lessonId },
        data: { quizId: created.id, type: 'QUIZ' },
      })

      return created
    })

    return NextResponse.json({ success: true, data: quiz }, { status: 201 })
  } catch (err) {
    console.error('POST quiz error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create quiz' }, { status: 500 })
  }
}

// ─── PUT — sync the full quiz shape (metadata + questions + options) ─────
//
// Deletion policy: a Question/Option that already has QuizAnswer rows
// referencing it (the schema has no cascade from QuizAnswer to Question/
// Option, by design, to protect historical attempt data) is never deleted —
// removing it from the incoming shape silently *keeps* it in place instead
// of failing the whole save, and its id is returned under `keptForHistory`
// so a future admin UI can tell the admin why it's still there. This was
// chosen over rejecting the whole PUT with a 409: an admin syncing an entire
// quiz form shouldn't lose every other edit in the same save because one old,
// already-answered question couldn't be removed.

export async function PUT(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !COURSE_MANAGER_ROLES.includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const lesson = await db.lesson.findUnique({ where: { id: params.lessonId }, select: { quizId: true } })
  if (!lesson?.quizId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'This lesson has no quiz yet — use POST to create one' }, { status: 404 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = quizSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 }
    )
  }

  const existingQuiz = await db.quiz.findUnique({ where: { id: lesson.quizId }, include: quizWithOptions })
  if (!existingQuiz) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Quiz not found' }, { status: 404 })
  }

  // Security: every question/option id the client sends must actually
  // belong to *this* quiz — never trust a bare id to be scoped correctly.
  for (const q of parsed.data.questions) {
    if (q.id) {
      const existingQ = existingQuiz.questions.find((eq) => eq.id === q.id)
      if (!existingQ) {
        return NextResponse.json<ApiResponse>({ success: false, error: `Question ${q.id} does not belong to this quiz` }, { status: 400 })
      }
      for (const o of q.options) {
        if (o.id && !existingQ.options.some((eo) => eo.id === o.id)) {
          return NextResponse.json<ApiResponse>({ success: false, error: `Option ${o.id} does not belong to question ${q.id}` }, { status: 400 })
        }
      }
    } else {
      for (const o of q.options) {
        if (o.id) {
          return NextResponse.json<ApiResponse>({ success: false, error: `Option ${o.id} was sent for a new question, which can't have existing options` }, { status: 400 })
        }
      }
    }
  }

  const keptQuestionIds: string[] = []
  const keptOptionIds: string[] = []

  try {
    await db.$transaction(async (tx) => {
      await tx.quiz.update({
        where: { id: existingQuiz.id },
        data: {
          title: parsed.data.title,
          instructions: parsed.data.instructions ?? null,
          passingScore: parsed.data.passingScore,
          maxAttempts: parsed.data.maxAttempts ?? null,
        },
      })

      const incomingQuestionIds = new Set(parsed.data.questions.filter((q) => q.id).map((q) => q.id!))

      // Remove questions the admin dropped from the form — unless they have prior answers.
      for (const eq of existingQuiz.questions) {
        if (!incomingQuestionIds.has(eq.id)) {
          const answered = await tx.quizAnswer.count({ where: { questionId: eq.id } })
          if (answered > 0) {
            keptQuestionIds.push(eq.id)
          } else {
            await tx.question.delete({ where: { id: eq.id } }) // cascades its options
          }
        }
      }

      // Upsert each incoming question.
      for (const q of parsed.data.questions) {
        if (q.id) {
          await tx.question.update({ where: { id: q.id }, data: { prompt: q.prompt, order: q.order, points: q.points } })

          const existingQ = existingQuiz.questions.find((eq) => eq.id === q.id)!
          const incomingOptionIds = new Set(q.options.filter((o) => o.id).map((o) => o.id!))

          // Remove options the admin dropped — unless they have prior answers.
          for (const eo of existingQ.options) {
            if (!incomingOptionIds.has(eo.id)) {
              const answered = await tx.quizAnswer.count({ where: { selectedOptionId: eo.id } })
              if (answered > 0) {
                keptOptionIds.push(eo.id)
              } else {
                await tx.option.delete({ where: { id: eo.id } })
              }
            }
          }

          for (const o of q.options) {
            if (o.id) {
              await tx.option.update({ where: { id: o.id }, data: { text: o.text, order: o.order, isCorrect: o.isCorrect } })
            } else {
              await tx.option.create({ data: { questionId: q.id, text: o.text, order: o.order, isCorrect: o.isCorrect } })
            }
          }
        } else {
          await tx.question.create({
            data: {
              quizId: existingQuiz.id,
              prompt: q.prompt,
              order: q.order,
              points: q.points,
              options: { create: q.options.map((o) => ({ text: o.text, order: o.order, isCorrect: o.isCorrect })) },
            },
          })
        }
      }
    })

    const finalQuiz = await db.quiz.findUnique({ where: { id: existingQuiz.id }, include: quizWithOptions })

    return NextResponse.json({
      success: true,
      data: {
        quiz: finalQuiz,
        keptForHistory: keptQuestionIds.length || keptOptionIds.length
          ? { questionIds: keptQuestionIds, optionIds: keptOptionIds }
          : null,
      },
    })
  } catch (err) {
    console.error('PUT quiz error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update quiz' }, { status: 500 })
  }
}
