// app/api/quizzes/[quizId]/attempts/route.ts
// Student quiz attempts — read own history, submit a new attempt.
//
// Keyed by quizId rather than courseId, but still enrollment-gated: the
// course is derived via quiz -> lesson -> module -> course, then run through
// the exact same requireEnrolledUser() helper every other "learn" route
// uses (lib/enrollment.ts) — a quiz being reachable by id alone must never
// bypass the enrollment check.
//
// P5: a passing attempt calls the shared markLessonComplete() (lib/completion.ts)
// for the quiz's lesson — the exact same function every other completion path
// uses, so certificate issuance stays in one place. A failing attempt never
// calls it. This route still never touches the Progress table directly.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireEnrolledUser } from '@/lib/enrollment'
import { markLessonComplete } from '@/lib/completion'
import type { ApiResponse } from '@/types'

type RouteContext = { params: { quizId: string } }

async function loadQuizForAttempt(quizId: string) {
  return db.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      passingScore: true,
      maxAttempts: true,
      lesson: { select: { id: true, module: { select: { courseId: true } } } },
      questions: {
        select: {
          id: true,
          points: true,
          options: { select: { id: true, isCorrect: true } },
        },
      },
    },
  })
}

// ─── GET — the requesting user's own attempt history for this quiz ────────

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const quiz = await db.quiz.findUnique({
    where: { id: params.quizId },
    select: { maxAttempts: true, lesson: { select: { module: { select: { courseId: true } } } } },
  })
  if (!quiz || !quiz.lesson) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Quiz not found' }, { status: 404 })
  }

  const check = await requireEnrolledUser(quiz.lesson.module.courseId)
  if (!check.ok) {
    return NextResponse.json<ApiResponse>({ success: false, error: check.error }, { status: check.status })
  }

  const attemptCount = await db.quizAttempt.count({ where: { userId: check.user.id, quizId: params.quizId } })

  // Best attempt, computed at read time (not cached) — per the audit's §5
  // recommendation, to avoid a second place pass/fail state could drift from
  // the attempt log.
  const best = await db.quizAttempt.findFirst({
    where: { userId: check.user.id, quizId: params.quizId },
    orderBy: [{ passed: 'desc' }, { score: 'desc' }, { submittedAt: 'desc' }],
    select: { id: true, score: true, passed: true, submittedAt: true },
  })

  const remaining = quiz.maxAttempts != null ? Math.max(0, quiz.maxAttempts - attemptCount) : null

  return NextResponse.json({
    success: true,
    data: { attemptCount, maxAttempts: quiz.maxAttempts, remaining, best },
  })
}

// ─── POST — submit a new attempt, scored entirely server-side ─────────────

const submitSchema = z.object({
  // Deliberately the *only* fields accepted — a client-supplied score/passed/
  // isCorrect claim has nowhere to go even if sent, since zod's default
  // "strip unknown keys" behavior drops anything else in the body before
  // this code ever runs, and nothing below ever reads such a field anyway.
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionId: z.string(),
  })).min(1, 'At least one answer is required'),
})

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const quiz = await loadQuizForAttempt(params.quizId)
  if (!quiz || !quiz.lesson) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Quiz not found' }, { status: 404 })
  }

  const check = await requireEnrolledUser(quiz.lesson.module.courseId)
  if (!check.ok) {
    return NextResponse.json<ApiResponse>({ success: false, error: check.error }, { status: check.status })
  }

  if (quiz.maxAttempts != null) {
    const attemptCount = await db.quizAttempt.count({ where: { userId: check.user.id, quizId: quiz.id } })
    if (attemptCount >= quiz.maxAttempts) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No attempts remaining for this quiz' },
        { status: 403 }
      )
    }
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 }
    )
  }

  // Score entirely server-side against the real Option.isCorrect values —
  // the client's answers are only ever used to look up which option was
  // picked per question; correctness/points always come from `quiz.questions`
  // (loaded from the DB above), never from the request body.
  const selectedByQuestion = new Map(parsed.data.answers.map((a) => [a.questionId, a.selectedOptionId]))

  let earnedPoints = 0
  let totalPoints = 0
  const answerRows: { questionId: string; selectedOptionId: string }[] = []

  for (const question of quiz.questions) {
    totalPoints += question.points
    const selectedOptionId = selectedByQuestion.get(question.id)
    if (!selectedOptionId) continue

    // Only accept an option that genuinely belongs to *this* question —
    // an option id from a different question can't be used to game scoring.
    const option = question.options.find((o) => o.id === selectedOptionId)
    if (!option) continue

    answerRows.push({ questionId: question.id, selectedOptionId })
    if (option.isCorrect) earnedPoints += question.points
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  // Passing is >=, not > — a score exactly equal to the threshold passes.
  const passed = score >= quiz.passingScore

  try {
    const attempt = await db.quizAttempt.create({
      data: {
        userId: check.user.id,
        quizId: quiz.id,
        score,
        passed,
        submittedAt: new Date(),
        answers: { create: answerRows },
      },
      select: { id: true, score: true, passed: true, submittedAt: true },
    })

    // Only a passing attempt marks the lesson complete — a failing attempt
    // is recorded (above) but has no downstream effect on completion.
    // P8: the completion result is now forwarded in the response so the
    // client can react (certificate toast) — this is a response-shape
    // addition only; markLessonComplete() itself and its call site are
    // unchanged from P5.
    let courseCompleted = false
    let certificateCreated = false
    if (passed) {
      const completion = await markLessonComplete(check.user.id, quiz.lesson.id)
      courseCompleted = completion.courseCompleted
      certificateCreated = completion.certificateCreated
    }

    return NextResponse.json({
      success: true,
      data: { ...attempt, courseCompleted, certificateCreated },
    }, { status: 201 })
  } catch (err) {
    console.error('POST quiz attempt error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to submit attempt' }, { status: 500 })
  }
}
