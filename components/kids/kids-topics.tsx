'use client'
// components/kids/kids-topics.tsx
// Featured lesson topics grid.
// Shows real DB courses if available; falls back to static topic cards.

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export interface KidsCourse {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail: string | null
  isFree: boolean
  price: number
}

const STATIC_TOPICS = [
  { emoji: '🤖', title: 'What is AI?', desc: 'Discover what artificial intelligence is and how it works in the real world.', color: 'from-violet-500 to-indigo-500', bg: 'bg-violet-50 border-violet-200' },
  { emoji: '🌍', title: 'AI Around Us', desc: 'Explore how AI is used every day — from streaming to smart speakers.', color: 'from-sky-400 to-blue-500', bg: 'bg-sky-50 border-sky-200' },
  { emoji: '💬', title: 'Talking to AI', desc: 'Learn how to write great prompts and have smart conversations with AI.', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50 border-emerald-200' },
  { emoji: '🛡️', title: 'AI Safety', desc: 'Understand why AI safety matters and how to use AI responsibly.', color: 'from-rose-400 to-pink-500', bg: 'bg-rose-50 border-rose-200' },
  { emoji: '🎨', title: 'Creative AI', desc: 'Use AI to make music, stories, art, and amazing creative projects.', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 border-amber-200' },
  { emoji: '🖼️', title: 'AI Art', desc: 'Create stunning images and visual art using AI image generators.', color: 'from-purple-400 to-violet-500', bg: 'bg-purple-50 border-purple-200' },
  { emoji: '📚', title: 'AI for School', desc: 'Learn how to use AI ethically to help with homework and projects.', color: 'from-indigo-400 to-blue-500', bg: 'bg-indigo-50 border-indigo-200' },
  { emoji: '💻', title: 'Coding with AI', desc: 'Use AI tools to write your first lines of code and build simple apps.', color: 'from-cyan-400 to-sky-500', bg: 'bg-cyan-50 border-cyan-200' },
  { emoji: '🚀', title: 'Future Careers', desc: 'Discover the exciting AI-powered jobs that will exist when you grow up.', color: 'from-fuchsia-400 to-purple-500', bg: 'bg-fuchsia-50 border-fuchsia-200' },
]

interface Props {
  courses: KidsCourse[]
}

export function KidsTopics({ courses }: Props) {
  const reduceMotion = useReducedMotion()
  const hasRealCourses = courses.length > 0

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm"
          >
            What You&apos;ll Learn
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="mt-5 text-3xl sm:text-[2.8rem] font-black tracking-tight text-slate-950 leading-tight"
          >
            Explore{' '}
            <span className="bg-[linear-gradient(110deg,#635bff,#38bdf8)] bg-clip-text text-transparent">
              amazing topics
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mt-4 text-slate-500 text-base leading-relaxed"
          >
            From understanding what AI is to creating your own AI-powered projects — every topic is designed to inspire and educate.
          </motion.p>
        </div>

        {hasRealCourses ? (
          /* Real course cards from DB */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: i * 0.06 }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="group relative rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-[0_8px_30px_-20px_rgba(15,23,42,0.18)] hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)] transition-all duration-300"
              >
                {/* Thumbnail or gradient placeholder */}
                <div className="h-40 bg-gradient-to-br from-violet-500/20 to-sky-500/20 relative overflow-hidden">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🤖</div>
                  )}
                  <div className="absolute top-3 right-3">
                    {course.isFree ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white text-xs font-bold">FREE</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/75 text-white text-xs font-bold">${course.price}</span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-950 group-hover:text-violet-700 transition-colors leading-snug">{course.title}</h3>
                  {course.description && (
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{course.description}</p>
                  )}
                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                  >
                    Start lesson <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Static fallback topic cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STATIC_TOPICS.map((topic, i) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: i * 0.06 }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className={`group relative rounded-[24px] border ${topic.bg} overflow-hidden shadow-[0_8px_30px_-20px_rgba(15,23,42,0.14)] hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.22)] transition-all duration-300 p-6`}
              >
                <div className="text-4xl mb-4 leading-none">{topic.emoji}</div>
                <h3 className="font-black text-slate-950 text-lg leading-snug">{topic.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{topic.desc}</p>
                <div className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${topic.color} opacity-60 group-hover:w-20 group-hover:opacity-100 transition-all duration-300`} />
              </motion.div>
            ))}
          </div>
        )}

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/courses?career=kid"
            id="kids-view-all-courses"
            className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-950 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            Browse all Kids courses
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
