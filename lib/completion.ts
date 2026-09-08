// lib/completion.ts
// Shared lesson-completion / course-completion / certificate-issuance logic.
//
// Step 1 was a pure extraction of the pre-existing POST /api/progress logic —
// same upsert, same "count Progress rows vs. all Lesson rows in the course"
// query, same certificate findFirst-then-create idempotency, same
// best-effort email. Verified byte-for-byte equivalent before Step 2 below
// was added (see the P5 report's Checkpoint A).
//
// Step 2 adds the new isFinalAssessment-aware completion rule as an explicit,
// separate branch — never a blended query — gated by BOTH:
//   1. Course shape: at least one lesson in the course has isFinalAssessment
//      = true. A course with no final assessment always takes the old
//      branch, byte-for-byte, regardless of the flag below.
//   2. The ENABLE_QUIZ_COMPLETION_GATING kill-switch (see below) — when
//      unset/false, the old branch is taken unconditionally, even for a
//      course that does have a final-assessment lesson.

import { db } from '@/lib/db'
import { sendCertificateEmail } from '@/lib/email'

// Kill-switch: when this is not exactly 'true', every course takes the
// original (pre-P5) all-lessons completion rule, full stop — the course-shape
// check below is never even evaluated. See the P5 report for why this is an
// env var rather than a DB-backed flag, and for this specific hosting setup's
// actual (not assumed) redeploy behavior.
const QUIZ_COMPLETION_GATING_ENABLED = process.env.ENABLE_QUIZ_COMPLETION_GATING === 'true'

export interface CompletionResult {
  progressCreated: boolean   // false if this Progress row already existed (idempotent upsert)
  completed: number
  total: number
  courseCompleted: boolean
  certificateCreated: boolean // false if one already existed
}

/**
 * Marks one lesson complete for a user and, if that completes the course,
 * issues a certificate (idempotent — a course that already has a Certificate
 * row for this user is never re-evaluated or re-created).
 *
 * courseId is derived from the lesson's own module relation rather than
 * trusted from a caller-supplied value. Every real caller in this app always
 * passes a lessonId that genuinely belongs to the course it's operating on
 * (the pre-refactor route never validated this either way — it just trusted
 * whatever courseId the request body carried), so this produces identical
 * results to the pre-refactor code for every real request, and additionally
 * can't be fooled by a lessonId/courseId pair that don't actually belong
 * together.
 */
export async function markLessonComplete(userId: string, lessonId: string): Promise<CompletionResult> {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  })
  if (!lesson) {
    throw new Error(`markLessonComplete: lesson ${lessonId} not found`)
  }
  const courseId = lesson.module.courseId

  const existingProgress = await db.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  })

  await db.progress.upsert({
    where:  { userId_lessonId: { userId, lessonId } },
    update: {},
    create: { userId, lessonId },
  })
  const progressCreated = !existingProgress

  // ── Completion check ─────────────────────────────────────────────────
  // Numerator/denominator come from the single shared helper below — the same
  // one GET /api/progress uses for its progress bar — so the displayed total
  // and the total that actually gates the certificate can never disagree.
  const { completed: completedCount, total } = await getCourseCompletionCounts(userId, courseId)

  const courseCompleted = completedCount >= total && total > 0

  let certificateCreated = false
  if (courseCompleted) {
    const existingCert = await db.certificate.findFirst({ where: { userId, courseId } })
    if (!existingCert) {
      // P6: populate finalScore only for a course with a final-assessment
      // lesson — the user's best attempt on that lesson's quiz (same
      // ORDER BY passed DESC, score DESC, submittedAt DESC shape as the
      // P4/P5 "best attempt" queries). A course with no final assessment
      // keeps finalScore null, exactly as before this phase. This lookup is
      // purely cosmetic — it runs whenever the course actually has a final-
      // assessment lesson, independent of the ENABLE_QUIZ_COMPLETION_GATING
      // kill-switch, which only governs which lessons count toward
      // completion, not what gets displayed on an already-decided certificate.
      const finalAssessmentLesson = await db.lesson.findFirst({
        where: { module: { courseId }, isFinalAssessment: true },
        select: { quizId: true },
      })

      let finalScore: number | null = null
      if (finalAssessmentLesson?.quizId) {
        const bestAttempt = await db.quizAttempt.findFirst({
          where: { userId, quizId: finalAssessmentLesson.quizId },
          orderBy: [{ passed: 'desc' }, { score: 'desc' }, { submittedAt: 'desc' }],
          select: { score: true },
        })
        finalScore = bestAttempt?.score ?? null
      }

      const cert = await db.certificate.create({
        data: { userId, courseId, finalScore },
        include: { course: { select: { title: true } } },
      })
      certificateCreated = true

      const user = await db.user.findUnique({ where: { id: userId } })
      if (user) {
        await sendCertificateEmail({
          to:            user.email,
          studentName:   user.name ?? 'Student',
          courseTitle:   cert.course.title,
          certificateId: cert.id,
        }).catch((err) => {
          console.error('⚠️ Certificate email failed (non-fatal):', err)
        })
      }
    }
  }

  return {
    progressCreated,
    completed: completedCount,
    total,
    courseCompleted,
    certificateCreated,
  }
}

/**
 * The completion numerator/denominator for one user in one course.
 *
 * This is the *literal* branch that used to live inline in markLessonComplete()
 * above — extracted verbatim so both that function and the display-only
 * GET /api/progress read path share exactly one definition of "how many
 * lessons must be done, and how many are". Do not fork this logic.
 *
 *   - Course has an isFinalAssessment lesson AND the kill-switch is on
 *       → only isRequired lessons count.
 *   - Otherwise (no final assessment, or kill-switch off)
 *       → every lesson in the course counts (byte-for-byte the pre-P5 query).
 */
export async function getCourseCompletionCounts(
  userId: string,
  courseId: string,
): Promise<{ completed: number; total: number }> {
  // Course-shape check only runs at all when the kill-switch is on — with it
  // off, this is skipped entirely and the old branch runs unconditionally.
  const hasFinalAssessment = QUIZ_COMPLETION_GATING_ENABLED
    ? (await db.lesson.count({ where: { module: { courseId }, isFinalAssessment: true } })) > 0
    : false

  let allLessons: { id: string }[]
  let completedCount: number

  if (hasFinalAssessment) {
    // New branch: only required lessons count toward the denominator/numerator.
    allLessons = await db.lesson.findMany({
      where: { module: { courseId }, isRequired: true },
      select: { id: true },
    })
    completedCount = await db.progress.count({
      where: { userId, lessonId: { in: allLessons.map((l) => l.id) } },
    })
  } else {
    // Old branch — byte-for-byte identical to the pre-P5 query. Every course
    // without a final-assessment lesson, and every course when the
    // kill-switch is off, takes this path.
    allLessons = await db.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true },
    })
    completedCount = await db.progress.count({
      where: { userId, lessonId: { in: allLessons.map((l) => l.id) } },
    })
  }

  return { completed: completedCount, total: allLessons.length }
}
