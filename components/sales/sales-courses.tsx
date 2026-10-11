'use client'
// components/sales/sales-courses.tsx
// Published Sales & Marketing courses from the DB, as glass cards.

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { GLASS, SectionHeader } from './sales-ui'

export interface SalesCourse {
  id: string
  title: string
  slug: string
  /** Plain-text summary (markdown already stripped on the server) */
  summary: string | null
  thumbnail: string | null
  isFree: boolean
  price: number
  lessonCount: number
}

interface Props {
  courses: SalesCourse[]
  browseHref: string
}

export function SalesCourses({ courses, browseHref }: Props) {
  const reduceMotion = useReducedMotion()

  return (
    <section id="courses" className="relative scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Courses"
          title="Start learning"
          accent="today."
          body="Practical, self-paced courses with short lessons, quizzes and a certificate when you finish."
        />

        {courses.length > 0 ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: (i % 3) * 0.08 }}
                whileHover={reduceMotion ? undefined : { y: -6 }}
              >
                <Link
                  href={`/courses/${course.slug}`}
                  className={`group flex h-full flex-col overflow-hidden rounded-[28px] p-2.5 transition-shadow hover:shadow-[0_30px_70px_-34px_rgba(79,70,229,0.5)] ${GLASS}`}
                >
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#e0e7ff,#ede9fe_50%,#dbeafe)]">
                    {course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-indigo-400">
                        <Sparkles size={40} />
                      </div>
                    )}
                    <span
                      className={[
                        'absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md',
                        course.isFree ? 'bg-emerald-500/90 text-white' : 'bg-white/85 text-[#0f1535]',
                      ].join(' ')}
                    >
                      {course.isFree ? 'Free' : `$${course.price}`}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                    <h3 className="text-lg font-bold leading-snug text-[#0f1535] group-hover:text-indigo-700 transition-colors">
                      {course.title}
                    </h3>
                    {course.summary && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{course.summary}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <BookOpen size={15} />
                        {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-600">
                        View course
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`mx-auto mt-12 max-w-xl rounded-[28px] p-10 text-center ${GLASS}`}>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <Sparkles size={26} />
            </span>
            <h3 className="mt-5 text-xl font-bold text-[#0f1535]">New courses are on the way</h3>
            <p className="mt-2 text-sm text-slate-600">
              We&apos;re putting the finishing touches on our Sales &amp; Marketing courses. Browse the full catalogue in the meantime.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href={browseHref}
            className="group inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur-md px-7 text-sm font-semibold text-[#0f1535] hover:border-indigo-200 hover:bg-white transition-all"
          >
            Browse all courses
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
