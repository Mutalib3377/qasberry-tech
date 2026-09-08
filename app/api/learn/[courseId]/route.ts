// app/api/learn/[courseId]/route.ts
// Returns full course structure for an enrolled user (includes muxPlaybackId for lessons).
// GET /api/learn/[courseId]

import { NextRequest, NextResponse } from 'next/server'
import { db }   from '@/lib/db'
import { getEmbedUrl } from '@/lib/video-embed'
import { requireEnrolledUser } from '@/lib/enrollment'
import type { ApiResponse } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseId: string } }
): Promise<NextResponse> {
  const check = await requireEnrolledUser(params.courseId)
  if (!check.ok) {
    return NextResponse.json<ApiResponse>({ success: false, error: check.error }, { status: check.status })
  }

  const course = await db.course.findUnique({
    where:   { id: params.courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            // Return all playback fields since user is enrolled
            select: {
              id: true, title: true, order: true,
              isFree: true, duration: true,
              muxPlaybackId: true,
              videoUrl: true,        // external link (YouTube, Drive, Vimeo, Loom)
              pdfUrl: true,          // external PDF / reading material link — legacy fallback
              documentKey: true,     // Supabase Storage object key for an in-app document, if migrated
              type: true,
              isRequired: true,
              isFinalAssessment: true,
              // Quiz data for type === 'QUIZ' lessons. Explicit select all the
              // way down — Option.isCorrect is deliberately never selected
              // here. Same discipline as the embed-only videoUrl above and
              // the signed-URL-only documentKey handling in P3: the client
              // only ever sees what it's safe to see.
              quiz: {
                select: {
                  id: true, title: true, instructions: true,
                  passingScore: true, maxAttempts: true,
                  questions: {
                    orderBy: { order: 'asc' },
                    select: {
                      id: true, prompt: true, order: true, points: true,
                      options: {
                        orderBy: { order: 'asc' },
                        select: { id: true, text: true, order: true }, // isCorrect intentionally omitted
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!course) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Course not found' }, { status: 404 })
  }

  // Never send the raw pasted share link to the browser — only the derived,
  // embed-only URL. Keeps the original Drive/YouTube/Vimeo/Loom link off the
  // client entirely, so it can't be lifted from the network response.
  const courseWithEmbedUrls = {
    ...course,
    modules: course.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((lesson) => ({
        ...lesson,
        videoUrl: lesson.videoUrl ? getEmbedUrl(lesson.videoUrl) : null,
      })),
    })),
  }

  return NextResponse.json({ success: true, data: courseWithEmbedUrls })
}
