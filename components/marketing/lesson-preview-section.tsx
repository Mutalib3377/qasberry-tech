'use client'
// components/marketing/lesson-preview-section.tsx
// "Peek inside a lesson" — an animated mock of the lesson screen built from a
// real course (lib/lesson-showcase.ts): its lesson list, video lengths, a
// reading excerpt and its first quiz question. Four views (Watch, Read, Quiz,
// Certificate) auto-advance; hovering, leaving the viewport or a hidden tab
// pauses, clicking a tab hands control to the visitor, and reduced motion
// turns auto-advance off.

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Award, BookOpen, CheckCircle2, HelpCircle, Play } from 'lucide-react'
import type { LessonShowcase } from '@/lib/lesson-showcase'
import { useReveal } from './robotics/use-reveal'
import { SectionHeading } from './robotics/ui'

const STAGE_MS = 5000

type Stage = 'watch' | 'read' | 'quiz' | 'certificate'

const STAGE_LABEL: Record<Stage, string> = {
  watch: 'Watch',
  read: 'Read',
  quiz: 'Quiz',
  certificate: 'Certificate',
}

const STAGE_ICON = { watch: Play, read: BookOpen, quiz: HelpCircle, certificate: Award }
const LESSON_ICON = { VIDEO: Play, READING: BookOpen, QUIZ: HelpCircle }

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function WatchStage({ data }: { data: LessonShowcase }) {
  const seconds = data.video?.seconds || 300
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      {data.course.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.course.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md">
        <Play size={26} fill="currentColor" className="ml-1" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="mb-2 text-sm font-semibold text-white">{data.video?.title}</p>
        <div className="h-1 overflow-hidden rounded-full bg-white/20">
          <div className="lp-scrub h-full origin-left rounded-full bg-[linear-gradient(90deg,#6E5BFF,#35C4E8)]" />
        </div>
        <div className="mt-1.5 flex justify-between font-hud text-[11px] text-white/70">
          <span>{clock(seconds * 0.3)}</span>
          <span>{clock(seconds)}</span>
        </div>
      </div>
    </div>
  )
}

function ReadStage({ data }: { data: LessonShowcase }) {
  if (!data.reading) return null
  return (
    <div className="flex aspect-video w-full flex-col justify-center rounded-2xl border border-rx-line bg-rx-chip-strong p-6 sm:p-8">
      <p className="rx-hud">Reading · {data.reading.minutes} min</p>
      <h4 className="mt-3 font-display text-xl font-bold text-rx-text sm:text-2xl">{data.reading.title}</h4>
      <p className="mt-3 text-sm leading-relaxed text-rx-body sm:text-base">{data.reading.excerpt}</p>
    </div>
  )
}

function QuizStage({ data }: { data: LessonShowcase }) {
  if (!data.quiz) return null
  return (
    <div className="flex aspect-video w-full flex-col justify-center rounded-2xl border border-rx-line bg-rx-chip-strong p-6 sm:p-8">
      <p className="rx-hud">Question 1 of {data.quiz.total}</p>
      <h4 className="mt-3 text-base font-bold text-rx-text sm:text-lg">{data.quiz.prompt}</h4>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {/* No option is highlighted: the correct answer isn't loaded, and a
            highlighted wrong answer would read as the right one */}
        {data.quiz.options.slice(0, 4).map((option) => (
          <li key={option} className="rounded-xl border border-rx-line px-3.5 py-2.5 text-sm text-rx-text-2">
            {option}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-rx-dim">Learners answer every question, then see their score straight away.</p>
    </div>
  )
}

function CertificateStage({ data }: { data: LessonShowcase }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-rx-line bg-rx-chip-strong p-6">
      <div className="w-full max-w-md rounded-2xl border border-rx-violet-line bg-rx-violet-tint p-6 text-center">
        <Award size={34} className="mx-auto text-rx-violet-ink" />
        <p className="rx-hud mt-3">Certificate of completion</p>
        <p className="mt-2 font-display text-lg font-bold text-rx-text">{data.course.title}</p>
        <p className="mt-1 text-sm text-rx-muted">Shareable with parents and schools</p>
      </div>
    </div>
  )
}

export function LessonPreviewSection({ data }: { data: LessonShowcase }) {
  const scope = useRef<HTMLElement>(null)
  useReveal(scope)

  const stages = (['watch', 'read', 'quiz', 'certificate'] as Stage[]).filter(
    (s) => (s !== 'read' || data.reading) && (s !== 'quiz' || data.quiz) && (s !== 'watch' || data.video)
  )
  const [stage, setStage] = useState<Stage>(stages[0])
  const [auto, setAuto] = useState(true)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  // Auto-advance only while on screen, in a visible tab, not hovered, and
  // only for visitors who haven't asked for reduced motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setAuto(false)
    const el = scope.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const [tabVisible, setTabVisible] = useState(true)
  useEffect(() => {
    const onChange = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  const running = auto && visible && tabVisible && !hovering

  function next() {
    setStage((s) => stages[(stages.indexOf(s) + 1) % stages.length])
  }

  const activeLesson =
    stage === 'watch' ? 'VIDEO' : stage === 'read' ? 'READING' : stage === 'quiz' ? 'QUIZ' : null

  return (
    <section ref={scope} id="lesson-preview" className="rx-bg relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          tag="Inside a lesson"
          title="Peek inside a real lesson"
          sub={`This is ${data.course.title}: short videos, readings and a quiz, with a certificate at the end.`}
        />

        <div
          data-reveal
          data-reveal-delay="0.1"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={() => setHovering(false)}
          className="rx-panel mx-auto mt-12 max-w-5xl overflow-hidden rounded-[28px]"
        >
          {/* App chrome */}
          <div className="flex items-center gap-3 border-b border-rx-line px-5 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </span>
            <span className="truncate font-hud text-[11px] text-rx-dim">qasberry · {data.course.title}</span>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr]">
            {/* Lesson list (real course structure) */}
            <ol className="hidden border-r border-rx-line p-4 lg:block" aria-label="Lessons in this course">
              {data.lessons.map((lesson, i) => {
                const Icon = LESSON_ICON[lesson.kind]
                const firstOfKind = data.lessons.findIndex((l) => l.kind === lesson.kind) === i
                const current = firstOfKind && lesson.kind === activeLesson
                return (
                  <li
                    key={i}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 ${current ? 'bg-rx-violet-tint' : ''}`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${current ? 'bg-rx-violet-tint text-rx-violet-ink' : 'bg-rx-chip text-rx-dim'}`}>
                      {i < 2 && !current ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Icon size={13} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] font-medium ${current ? 'text-rx-text' : 'text-rx-text-2'}`}>{lesson.title}</span>
                      <span className="block font-hud text-[10px] text-rx-dim">{lesson.meta}</span>
                    </span>
                  </li>
                )
              })}
            </ol>

            {/* Stage */}
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Lesson preview">
                {stages.map((s) => {
                  const Icon = STAGE_ICON[s]
                  const selected = s === stage
                  return (
                    <button
                      key={s}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => {
                        setAuto(false)
                        setStage(s)
                      }}
                      className={`relative inline-flex items-center gap-2 overflow-hidden rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                        selected
                          ? 'border-rx-violet-line text-rx-text'
                          : 'border-rx-line text-rx-muted hover:border-rx-line-strong hover:text-rx-text'
                      }`}
                    >
                      {selected && auto && (
                        // Fill shows time left on this view; finishing advances to the next
                        <span
                          key={stage}
                          aria-hidden
                          onAnimationEnd={next}
                          className="lp-progress absolute inset-0 origin-left bg-rx-violet-tint"
                          style={{ animationDuration: `${STAGE_MS}ms`, animationPlayState: running ? 'running' : 'paused' }}
                        />
                      )}
                      {selected && !auto && <span aria-hidden className="absolute inset-0 bg-rx-violet-tint" />}
                      <Icon size={14} className="relative" />
                      <span className="relative">{STAGE_LABEL[s]}</span>
                    </button>
                  )
                })}
              </div>

              <div key={stage} className="rx-page-enter" role="tabpanel" aria-label={STAGE_LABEL[stage]}>
                {stage === 'watch' && <WatchStage data={data} />}
                {stage === 'read' && <ReadStage data={data} />}
                {stage === 'quiz' && <QuizStage data={data} />}
                {stage === 'certificate' && <CertificateStage data={data} />}
              </div>
            </div>
          </div>
        </div>

        <div data-reveal data-reveal-delay="0.15" className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/courses/${data.course.slug}${data.hasFreePreview ? '#free-preview' : ''}`}
            className="rx-cta group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold"
          >
            {data.hasFreePreview ? 'Watch a free lesson' : 'Explore this course'}
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-2xl border border-rx-line-strong bg-rx-chip px-6 py-3.5 text-sm font-semibold text-rx-text-2 transition-colors hover:border-rx-line-hover hover:text-rx-text"
          >
            Browse all courses
          </Link>
        </div>
      </div>
    </section>
  )
}
