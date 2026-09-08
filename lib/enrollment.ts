// lib/enrollment.ts
// Shared enrollment check for every "learn" route that serves enrolled-only
// course content (course structure, Mux playback tokens, document URLs, ...).
// Extracted from app/api/learn/[courseId]/route.ts so every consumer runs the
// exact same check instead of re-implementing the Prisma query per route.

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import type { User } from '@prisma/client'

export type EnrollmentCheckResult =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 403 | 404; error: string }

/**
 * Verifies the current Clerk session belongs to a user enrolled in `courseId`.
 * Returns the local User record on success, or a ready-to-return
 * status+error pair (matching the exact strings/status codes this route
 * family has always used) on failure.
 */
export async function requireEnrolledUser(courseId: string): Promise<EnrollmentCheckResult> {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) {
    return { ok: false, status: 404, error: 'User not found' }
  }

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })
  if (!enrollment) {
    return { ok: false, status: 403, error: 'Not enrolled' }
  }

  return { ok: true, user }
}
