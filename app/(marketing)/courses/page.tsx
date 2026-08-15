// app/(marketing)/courses/page.tsx
// Public course catalog — filterable grid of published courses.
// Server component with unified whitish glassmorphism card design.

import { db }          from '@/lib/db'
import Link            from 'next/link'
import type { Metadata } from 'next'
import { BookOpen, Users, Star, Zap, Search } from 'lucide-react'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { Footer }       from '@/components/marketing/footer'
import { Badge }        from '@/components/shared/Badge'

export const metadata: Metadata = {
  title: 'Courses | Qasberry',
  description: 'Browse Qasberry\'s AI courses tailored for your career. Filter by career track, difficulty, or price.',
}

interface PageProps {
  searchParams: { career?: string; difficulty?: string; q?: string }
}

const DIFFICULTY_VARIANTS: Record<string, 'success' | 'warning' | 'error'> = {
  BEGINNER:     'success',
  INTERMEDIATE: 'warning',
  ADVANCED:     'error',
}

export default async function CourseCatalogPage({ searchParams }: PageProps) {
  const { career: careerSlug, difficulty, q } = searchParams

  const careers = await db.career.findMany({ orderBy: { name: 'asc' } })

  const selectedCareer = careerSlug
    ? careers.find((c) => c.slug === careerSlug)
    : null

  const courses = await db.course.findMany({
    where: {
      status: 'PUBLISHED',
      ...(selectedCareer ? { careerId: selectedCareer.id } : {}),
      ...(difficulty ? { difficulty: difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' } : {}),
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    },
    include: {
      career:      true,
      _count:      { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-brand-bg text-brand-charcoal flex flex-col">
      {/* Background Soft Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-violet-500/8 blur-[120px]" />
      </div>

      <MarketingNav />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-10 w-full">
        {/* Header */}
        <div className="space-y-3">
          <Badge variant="primary" className="px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
            Course Catalog
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-charcoal">Browse Courses</h1>
          <p className="text-brand-secondary text-lg">AI courses tailored to your profession and career goals.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center pt-2">
          {/* Search */}
          <form method="GET" className="flex-1 min-w-[240px] max-w-sm">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search courses…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-brand-charcoal text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple shadow-sm transition-all"
              />
            </div>
          </form>

          {/* Career filter */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/courses"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                !careerSlug
                  ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple/25 border border-brand-purple'
                  : 'bg-white/80 backdrop-blur-md border border-slate-200/80 text-brand-secondary hover:text-brand-charcoal hover:border-slate-300'
              }`}
            >
              All Careers
            </Link>
            {careers.map((c) => (
              <Link
                key={c.id}
                href={`/courses?career=${c.slug}${difficulty ? `&difficulty=${difficulty}` : ''}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  careerSlug === c.slug
                    ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple/25 border border-brand-purple'
                    : 'bg-white/80 backdrop-blur-md border border-slate-200/80 text-brand-secondary hover:text-brand-charcoal hover:border-slate-300'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-2">
            {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((d) => (
              <Link
                key={d}
                href={`/courses?${careerSlug ? `career=${careerSlug}&` : ''}difficulty=${d}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  difficulty === d
                    ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple/25 border border-brand-purple'
                    : 'bg-white/80 backdrop-blur-md border border-slate-200/80 text-brand-secondary hover:text-brand-charcoal hover:border-slate-300'
                }`}
              >
                {d[0] + d.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-brand-tertiary text-sm font-medium">{courses.length} course{courses.length !== 1 ? 's' : ''} found</p>

        {/* Grid */}
        {courses.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <BookOpen size={40} className="mx-auto text-slate-300" />
            <p className="text-brand-secondary font-medium">No courses match your filters.</p>
            <Link href="/courses" className="text-brand-purple hover:text-brand-purple-hover text-sm font-semibold transition-colors inline-block pt-1">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl hover:border-brand-purple/40 hover:shadow-[0_20px_45px_-18px_rgba(91,92,246,0.22)] hover:-translate-y-1 overflow-hidden transition-all duration-300 shadow-[0_10px_35px_-20px_rgba(16,24,40,0.12)]"
              >
                {/* Thumbnail */}
                <div className="relative h-44 bg-gradient-to-br from-violet-100/60 via-slate-50 to-cyan-50/60 overflow-hidden border-b border-slate-100">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap size={36} className="text-brand-purple/30" />
                    </div>
                  )}
                  {/* Price badge */}
                  <div className="absolute top-3.5 right-3.5">
                    {course.isFree ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-sm backdrop-blur-md">
                        FREE
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-brand-charcoal text-xs font-bold shadow-sm">
                        ${Number(course.price).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6 gap-3.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="primary">
                      {course.career.name}
                    </Badge>
                    <Badge variant={DIFFICULTY_VARIANTS[course.difficulty] ?? 'default'}>
                      {course.difficulty[0] + course.difficulty.slice(1).toLowerCase()}
                    </Badge>
                  </div>

                  <h2 className="text-brand-charcoal font-bold text-lg leading-snug group-hover:text-brand-purple transition-colors line-clamp-2">
                    {course.title}
                  </h2>

                  {course.description && (
                    <p className="text-brand-secondary text-sm leading-relaxed line-clamp-2">{course.description}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-medium text-brand-tertiary">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-brand-purple" />
                      {course._count.enrollments} enrolled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star size={13} className="text-amber-500" />
                      {course.difficulty[0] + course.difficulty.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
