// app/(marketing)/courses/[slug]/page.tsx
// Public course detail page — description, curriculum preview, enroll CTA.
// Free lessons show a Mux preview. Server component with whitish glassmorphism layout.

import { db }           from '@/lib/db'
import { notFound }     from 'next/navigation'
import { currentUser }  from '@clerk/nextjs/server'
import Link             from 'next/link'
import type { Metadata } from 'next'
import {
  BookOpen, Clock, Users, Zap, ChevronDown,
  CheckCircle2, Lock, Play, ArrowRight,
} from 'lucide-react'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { Footer }       from '@/components/marketing/footer'
import { EnrollButton } from '@/components/course/enroll-button'
import { Badge }        from '@/components/shared/Badge'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await db.course.findUnique({
    where:   { slug: params.slug },
    select:  { title: true, description: true },
  })
  return {
    title:       course ? `${course.title} | Qasberry` : 'Course | Qasberry',
    description: course?.description ?? undefined,
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

  if (!course) notFound()

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

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0)
  const freeLessons  = course.modules.flatMap((m) => m.lessons).filter((l) => l.isFree)

  return (
    <div className="min-h-screen bg-brand-bg text-brand-charcoal flex flex-col">
      {/* Soft Top Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-500/8 blur-[120px]" />
      </div>

      <MarketingNav />

      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-6 pt-32 pb-20 w-full">
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
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight leading-tight">{course.title}</h1>
              {course.description && (
                <p className="text-brand-secondary text-lg leading-relaxed">{course.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-brand-tertiary pt-1">
                <span className="flex items-center gap-1.5">
                  <Users size={15} className="text-brand-purple" />
                  {course._count.enrollments} enrolled
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} className="text-brand-purple" />
                  {totalLessons} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-brand-purple" />
                  {course.modules.length} modules
                </span>
              </div>
            </div>

            {/* Thumbnail */}
            {course.thumbnail && (
              <div className="w-full h-72 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Free lesson previews */}
            {freeLessons.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-brand-charcoal">Free Previews</h2>
                <div className="space-y-2.5">
                  {freeLessons.slice(0, 3).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 backdrop-blur-md"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Play size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-brand-charcoal font-medium text-sm">{lesson.title}</span>
                      <Badge variant="success" className="ml-auto">
                        Free
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xl font-bold text-brand-charcoal">Curriculum</h2>
              <div className="space-y-3">
                {course.modules.map((mod) => (
                  <details key={mod.id} className="group rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-sm overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-surface transition-colors list-none">
                      <div className="flex items-center gap-3">
                        <BookOpen size={16} className="text-brand-purple flex-shrink-0" />
                        <span className="text-brand-charcoal font-bold text-base">{mod.title}</span>
                        <span className="text-brand-tertiary text-xs font-medium">({mod.lessons.length} lessons)</span>
                      </div>
                      <ChevronDown size={16} className="text-brand-tertiary group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="border-t border-slate-100 divide-y divide-slate-100 bg-brand-surface/30">
                      {mod.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-5 py-3.5">
                          {lesson.isFree
                            ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                            : <Lock size={15} className="text-slate-400 flex-shrink-0" />
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
            <div className="sticky top-28 p-7 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_16px_40px_-20px_rgba(16,24,40,0.15)] space-y-6">
              {/* Price */}
              <div>
                {course.isFree ? (
                  <p className="text-4xl font-extrabold text-emerald-600">FREE</p>
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

              {/* What you get */}
              <ul className="space-y-3 pt-4 border-t border-slate-100">
                {[
                  `${totalLessons} lessons across ${course.modules.length} modules`,
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
      </main>

      <Footer />
    </div>
  )
}
