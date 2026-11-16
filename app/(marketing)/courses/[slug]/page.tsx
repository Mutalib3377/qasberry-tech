// app/(marketing)/courses/[slug]/page.tsx
// Public course detail page — description, curriculum preview, enroll CTA.
// Lessons an admin marked as free previews play inline (#free-preview), no sign-in needed.

import { db }           from '@/lib/db'
import { notFound }     from 'next/navigation'
import { isCareerVisible } from '@/lib/features'
import { currentUser }  from '@clerk/nextjs/server'
import Link             from 'next/link'
import type { Metadata } from 'next'
import {
  BookOpen, Clock, Users, Zap, ChevronDown,
  CheckCircle2, Lock, Play, ArrowRight,
} from 'lucide-react'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { EnrollButton } from '@/components/course/enroll-button'
import { LessonPreviewPlayer } from '@/components/course/lesson-preview-player'
import { buildPreviewItems } from '@/lib/lesson-preview'
import { Badge }        from '@/components/shared/Badge'
import { ageRangeLabel } from '@/lib/age-groups'
import { Markdown, stripMarkdown } from '@/components/shared/markdown'
import { ReadAloud } from '@/components/shared/read-aloud'
import { plural, contentSummary } from '@/lib/plural'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await db.course.findUnique({
    where:   { slug: params.slug },
    select:  { title: true, description: true },
  })
  return {
    title:       course ? course.title : 'Course',
    description: course?.description ? stripMarkdown(course.description).slice(0, 160) : undefined,
  }
}

const DIFFICULTY_VARIANTS: Record<string, 'success' | 'warning' | 'error'> = {
  BEGINNER:     'success',
  INTERMEDIATE: 'warning',
  ADVANCED:     'error',
}

export default async function CourseDetailPage({ params }: PageProps) {
  const [course, user] = await Promise.all([
    db.course.findUnique({
      where:   { slug: params.slug, status: 'PUBLISHED' },
      include: {
        career:  true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    }),
    currentUser(),
  ])

  // MVP: courses in hidden careers aren't reachable from the public site
  if (!course || !isCareerVisible(course.career.slug)) notFound()

  // Check if signed-in user is already enrolled
  let isEnrolled = false
  if (user) {
    const dbUser = await db.user.findUnique({ where: { clerkId: user.id } })
    if (dbUser) {
      const enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId: dbUser.id, courseId: course.id } },
      })
      isEnrolled = !!enrollment
    }
  }

  const allLessons   = course.modules.flatMap((m) => m.lessons)
  const previewItems = buildPreviewItems(allLessons)

  return (
    <MarketingShell width="wide">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left: course info ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-brand-tertiary">
              <Link href="/courses" className="hover:text-brand-purple transition-colors">Courses</Link>
              <span>/</span>
              <span className="text-brand-secondary font-medium">{course.career.name}</span>
            </nav>

            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">
                  {course.career.name}
                </Badge>
                <Badge variant={DIFFICULTY_VARIANTS[course.difficulty] ?? 'default'}>
                  {course.difficulty[0] + course.difficulty.slice(1).toLowerCase()}
                </Badge>
                <Badge variant="info">{ageRangeLabel(course.ageGroups)}</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight leading-tight">{course.title}</h1>
              {course.description && (
                <>
                  <ReadAloud text={course.description} title={course.title} label="Listen to this course" />
                  <Markdown className="text-brand-secondary text-lg leading-relaxed">{course.description}</Markdown>
                </>
              )}
              <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-brand-tertiary pt-1">
                <span className="flex items-center gap-1.5">
                  <Users size={15} className="text-brand-purple" />
                  {course._count.enrollments} enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} className="text-brand-purple" />
                  {contentSummary(allLessons)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-brand-purple" />
                  {plural(course.modules.length, 'module')}
                </span>
              </div>
            </div>

            {/* Thumbnail */}
            {course.thumbnail && (
              <div className="w-full h-72 rounded-3xl overflow-hidden border border-rx-line shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Free lesson previews — playable without signing in */}
            {previewItems.length > 0 && (
              <section id="free-preview" className="scroll-mt-28 space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-brand-charcoal">Free preview</h2>
                  <p className="text-sm text-brand-tertiary">Try a lesson before you enroll. No account needed.</p>
                </div>
                <LessonPreviewPlayer items={previewItems} />
              </section>
            )}

            {/* Curriculum */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xl font-bold text-brand-charcoal">Curriculum</h2>
              <div className="space-y-3">
                {course.modules.map((mod) => (
                  <details key={mod.id} className="group rounded-2xl border border-rx-line bg-rx-chip-strong backdrop-blur-xl shadow-sm overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-surface transition-colors list-none">
                      <div className="flex items-center gap-3">
                        <BookOpen size={16} className="text-brand-purple flex-shrink-0" />
                        <span className="text-brand-charcoal font-bold text-base">{mod.title}</span>
                        <span className="text-brand-tertiary text-xs font-medium">({contentSummary(mod.lessons)})</span>
                      </div>
                      <ChevronDown size={16} className="text-brand-tertiary group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="border-t border-rx-line divide-y divide-rx-line bg-brand-surface/30">
                      {mod.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-5 py-3.5">
                          {lesson.isFree
                            ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                            : <Lock size={15} className="text-rx-dim flex-shrink-0" />
                          }
                          <span className="text-brand-secondary text-sm font-medium flex-1">{lesson.title}</span>
                          {lesson.isFree && (
                            <Badge variant="success" className="text-[10px]">Free</Badge>
                          )}
                          {lesson.duration && (
                            <span className="text-brand-tertiary text-xs">
                              {Math.floor(lesson.duration / 60)}m
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: enroll card (sticky glass card) ────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-7 rounded-3xl border border-rx-line bg-rx-chip-strong backdrop-blur-xl shadow-[0_16px_40px_-20px_rgba(16,24,40,0.15)] space-y-6">
              {/* Price */}
              <div>
                {course.isFree ? (
                  <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-300">FREE</p>
                ) : (
                  <p className="text-4xl font-extrabold text-brand-charcoal">
                    ${Number(course.price).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Enroll button */}
              {isEnrolled ? (
                <Link
                  href={`/learn/${course.id}`}
                  id="continue-learning-btn"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Continue learning <ArrowRight size={16} />
                </Link>
              ) : user ? (
                <EnrollButton
                  courseId={course.id}
                  price={Number(course.price)}
                  isFree={course.isFree}
                />
              ) : (
                <Link
                  href="/sign-in"
                  id="signin-to-enroll-btn"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-purple hover:bg-brand-purple-hover text-white font-bold rounded-xl transition-colors shadow-md shadow-brand-purple/20"
                >
                  Sign in to enroll <ArrowRight size={16} />
                </Link>
              )}

              {previewItems.length > 0 && (
                <a
                  href="#free-preview"
                  id="watch-free-lesson-btn"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-rx-line-strong bg-rx-chip text-brand-charcoal text-sm font-semibold hover:border-brand-purple/40 transition-colors"
                >
                  <Play size={15} className="text-brand-purple" />
                  Watch a free lesson
                </a>
              )}

              {/* What you get */}
              <ul className="space-y-3 pt-4 border-t border-rx-line">
                {[
                  `${contentSummary(allLessons, { natural: true })} across ${plural(course.modules.length, 'module')}`,
                  'Lifetime access',
                  'Certificate on completion',
                  course.isFree ? 'Completely free access' : 'One-time payment',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-brand-secondary text-sm">
                    <Zap size={14} className="text-brand-purple flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </MarketingShell>
  )
}
