// app/dashboard/page.tsx
// Student dashboard: In Progress / Completed / Certificates tabs (?tab=).
// Works out each course's state, next unfinished lesson and last activity here,
// so the client only renders.
// Protected by middleware.
// Admin users are redirected to /admin.

import { currentUser } from '@clerk/nextjs/server'
import { redirect }    from 'next/navigation'
import { db }          from '@/lib/db'
import type { Metadata } from 'next'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personalised Qasberry AI learning dashboard.',
}

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  // Fetch DB user to get enrollments + certificates
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              career: true,
              modules: {
                orderBy: { order: 'asc' },
                include: { lessons: { orderBy: { order: 'asc' }, select: { id: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      certificates: {
        include: { course: true },
        orderBy: { issuedAt: 'desc' },
      },
      progress: {
        select: { lessonId: true, completedAt: true },
      },
    },
  })

  const role = (user.publicMetadata as { role?: string })?.role ?? 'STUDENT'

  // Redirect admin/staff users away from the student dashboard
  const ADMIN_ROLES = ['SUPER_ADMIN', 'CONTENT_MANAGER', 'MODERATOR']
  if (ADMIN_ROLES.includes(role)) {
    redirect('/admin')
  }

  // Completed lesson id → when it was completed
  const completedAt = new Map((dbUser?.progress ?? []).map((p) => [p.lessonId, p.completedAt]))
  const certByCourse = new Map((dbUser?.certificates ?? []).map((c) => [c.courseId, c.id]))

  const enrollmentData = (dbUser?.enrollments ?? [])
    .map((e) => {
      const lessonIds = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
      const completedCount = lessonIds.filter((id) => completedAt.has(id)).length
      const certificateId = certByCourse.get(e.courseId) ?? null
      // A certificate means the course is done even if optional lessons were skipped
      const isComplete = !!certificateId || (lessonIds.length > 0 && completedCount === lessonIds.length)
      const nextLessonId = lessonIds.find((id) => !completedAt.has(id)) ?? null
      const lastActivity = lessonIds.reduce<Date>((latest, id) => {
        const at = completedAt.get(id)
        return at && at > latest ? at : latest
      }, e.createdAt)
      return {
        id:              e.id,
        courseId:        e.courseId,
        courseTitle:     e.course.title,
        courseThumbnail: e.course.thumbnail,
        career:          e.course.career.name,
        lessonCount:     lessonIds.length,
        completedCount,
        isComplete,
        certificateId,
        // "Continue" resumes at the first unfinished lesson; the course root
        // (/learn/[id]) always opens lesson one
        continueHref:    nextLessonId && !isComplete ? `/learn/${e.courseId}/${nextLessonId}` : `/learn/${e.courseId}`,
        lastActivity:    lastActivity.toISOString(),
      }
    })
    // Most recently studied first
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))

  const certificateData = (dbUser?.certificates ?? []).map((c) => ({
    id:          c.id,
    courseTitle: c.course.title,
    issuedAt:    c.issuedAt.toISOString(),
    url:         c.certificateUrl,
  }))

  return (
    <DashboardClient
      firstName={user.firstName ?? 'there'}
      role={role}
      enrollments={enrollmentData}
      certificates={certificateData}
    />
  )
}
