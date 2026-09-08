// app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/document/route.ts
// Admin API: upload (or replace) a lesson's PDF document in Supabase Storage.
//
// Separated from the general lesson PATCH route — same pattern as
// app/api/admin/mux/upload/route.ts being separate from the lesson PATCH for
// video fields. File upload has a different request shape (multipart, not
// JSON) and its own external side effect (Storage), so it gets its own route.
//
// Flow:
//   1. Admin selects a PDF (POST multipart/form-data, field name "file")
//   2. This endpoint uploads it to the private `lesson-documents` bucket
//   3. lesson.documentKey is updated to the new object key
//   4. If the lesson already had a document, the old object is deleted so
//      nothing orphaned is left in the bucket
//
// Security: only SUPER_ADMIN and CONTENT_MANAGER can upload — same role-gate
// used by every other app/api/admin/ route.

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { uploadLessonDocument, deleteLessonDocument, createSignedDocumentUrl } from '@/lib/supabase-storage'
import type { UserRole, ApiResponse } from '@/types'

const COURSE_MANAGER_ROLES: UserRole[] = ['SUPER_ADMIN', 'CONTENT_MANAGER']
const MAX_FILE_BYTES = 20 * 1024 * 1024 // 20MB

type RouteContext = { params: { courseId: string; moduleId: string; lessonId: string } }

// Helper: read role from Clerk publicMetadata directly (same as every other admin route)
async function getUserRole(userId: string): Promise<UserRole | undefined> {
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  return (user.publicMetadata as { role?: UserRole })?.role
}

// GET — signed preview URL for the admin editor's inline PdfViewer.
// Added in P7: the student-facing document-url route (P3) requires
// requireEnrolledUser(), which an admin editing a course they aren't
// enrolled in would fail. This mirrors that route's one job — mint a signed
// URL via the same, unmodified createSignedDocumentUrl() — but gated by the
// admin role-check already used throughout this file, not enrollment.
export async function GET(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !(['SUPER_ADMIN', 'CONTENT_MANAGER', 'MODERATOR'] as UserRole[]).includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const lesson = await db.lesson.findUnique({ where: { id: params.lessonId }, select: { documentKey: true } })
  if (!lesson?.documentKey) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'This lesson has no document' }, { status: 404 })
  }

  const url = await createSignedDocumentUrl(lesson.documentKey)
  return NextResponse.json({ success: true, data: { url } })
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !COURSE_MANAGER_ROLES.includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const lesson = await db.lesson.findUnique({
    where: { id: params.lessonId },
    select: { id: true, documentKey: true },
  })
  if (!lesson) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Lesson not found' }, { status: 404 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'No file provided' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Only PDF files are supported' }, { status: 400 })
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'PDF must be under 20MB' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name || 'notes.pdf'

    const newKey = await uploadLessonDocument(params.lessonId, buffer, filename)

    const updated = await db.lesson.update({
      where: { id: params.lessonId },
      data: { documentKey: newKey },
      select: { id: true, documentKey: true },
    })

    // Best-effort cleanup of the previous document — the DB update above is
    // the source of truth and has already succeeded; a failure here only
    // leaks an orphaned Storage object, it never blocks the upload response.
    if (lesson.documentKey && lesson.documentKey !== newKey) {
      try {
        await deleteLessonDocument(lesson.documentKey)
        console.log(`✅ Deleted replaced document ${lesson.documentKey} for lesson ${params.lessonId}`)
      } catch (cleanupErr) {
        console.error(`⚠️ Failed to delete replaced document ${lesson.documentKey} for lesson ${params.lessonId} (non-fatal):`, cleanupErr)
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error('POST document upload error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to upload document' }, { status: 500 })
  }
}
