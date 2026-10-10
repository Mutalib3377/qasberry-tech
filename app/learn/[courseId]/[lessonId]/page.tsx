'use client'
// app/learn/[courseId]/[lessonId]/page.tsx
// Course learning experience: Mux video player, curriculum sidebar, progress tracking.

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2, Circle, Lock, ChevronRight,
  ChevronLeft, Award, Menu, X, Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MuxPlayerReact from '@mux/mux-player-react'
import { PdfViewer } from '@/components/lesson/pdf-viewer'
import { Markdown } from '@/components/shared/markdown'
import { QuizPlayer, type QuizPlayerData, type QuizAttemptOutcome } from '@/components/lesson/quiz-player'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lesson {
  id:                 string
  title:              string
  order:              number
  isFree:             boolean
  duration:           number | null
  muxPlaybackId:      string | null // only returned for enrolled lessons
  videoUrl:           string | null // external link: YouTube, Drive, Vimeo, Loom
  pdfUrl:             string | null // external PDF link — legacy fallback
  documentKey:        string | null // Supabase Storage object key for an in-app document, if migrated
  content:            string | null // markdown notes for READING lessons with no PDF
  type:               'VIDEO' | 'READING' | 'QUIZ'
  isRequired:         boolean
  isFinalAssessment:  boolean
  quiz:               QuizPlayerData | null
}

interface Module {
  id:      string
  title:   string
  order:   number
  lessons: Lesson[]
}

interface CourseData {
  id:      string
  title:   string
  modules: Module[]
}

// ── Mux Video Player ─────────────────────────────────────────────────────────
// `token` is a short-lived signed-playback JWT fetched from
// /api/learn/[courseId]/[lessonId]/playback-token — a signed-policy Mux asset
// (see lib/mux.ts createMuxUpload) is unplayable without one, so we show a
// loading state rather than the player until it arrives.

function MuxVideoPlayer({
  playbackId, token, title, onEnded,
}: { playbackId: string; token: string | null; title: string; onEnded: () => void }) {
  if (!token) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
      <MuxPlayerReact
        playbackId={playbackId}
        tokens={{ playback: token }}
        metadata={{ video_title: title }}
        onEnded={onEnded}
        streamType="on-demand"
        className="w-full h-full"
      />
    </div>
  )
}

// ── External Video Player ─────────────────────────────────────────────────────
// `videoUrl` here is already an embed-only URL (transformed server-side in
// /api/learn/[courseId] — the raw pasted share link never reaches the client).

function ExternalVideoPlayer({ videoUrl }: { videoUrl: string }) {
  const isDrive = videoUrl.includes('drive.google.com')

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
      <iframe
        src={videoUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title="Lesson video"
      />
      {/* Google Drive's embedded viewer has its own "open in new window" icon
          in the top-right corner that we can't remove (cross-origin iframe) —
          this transparent overlay blocks clicks from reaching it so playback
          stays on-site. Rest of the player (play/pause/seek) is unaffected. */}
      {isDrive && (
        <div
          className="absolute top-0 right-0 w-16 h-12 cursor-default"
          title="This video can only be watched here"
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
        />
      )}
    </div>
  )
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>{pct}%</span>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

interface PageProps {
  params: { courseId: string; lessonId: string }
}

// This is a client component that fetches its own data from the API
export default function LearnPage({ params }: PageProps) {
  const { courseId, lessonId } = params
  const router = useRouter()

  const [course,     setCourse]     = useState<CourseData | null>(null)
  const [lesson,     setLesson]     = useState<Lesson | null>(null)
  const [completed,  setCompleted]  = useState<Set<string>>(new Set())
  // `completedCount` / `total` are the progress-bar's numerator / denominator,
  // both from GET /api/progress → getCourseCompletionCounts (the same helper
  // that gates the certificate). `completed` (the Set) is only for per-lesson
  // sidebar checkmarks and can legitimately hold more ids than `completedCount`
  // when a course has a completed non-required lesson.
  const [completedCount, setCompletedCount] = useState(0)
  const [total,      setTotal]      = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading,    setLoading]    = useState(true)
  const [marking,    setMarking]    = useState(false)
  const [certIssued, setCertIssued] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [playbackToken, setPlaybackToken] = useState<string | null>(null)
  const [documentUrl,   setDocumentUrl]   = useState<string | null>(null)

  // Fetch course + progress
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [courseRes, progressRes] = await Promise.all([
          fetch(`/api/learn/${courseId}`),
          fetch(`/api/progress?courseId=${courseId}`),
        ])
        const courseData    = await courseRes.json()
        const progressData  = await progressRes.json()

        if (!courseData.success)   { setError('Course not found.'); return }
        if (!progressData.success) { setError('Could not load progress.'); return }

        setCourse(courseData.data)
        setCompleted(new Set(progressData.data.completedLessonIds as string[]))
        setCompletedCount(progressData.data.completed as number)
        setTotal(progressData.data.total as number)

        // Find the current lesson
        const allLessons = (courseData.data as CourseData).modules.flatMap((m) => m.lessons)
        const cur = allLessons.find((l) => l.id === lessonId)
        setLesson(cur ?? allLessons[0] ?? null)
      } catch {
        setError('Failed to load. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, lessonId])

  // Fetch a fresh signed playback token whenever the current lesson has a Mux
  // asset. Reset to null on every lesson change first, so a stale token from
  // the previous lesson is never handed to a different playbackId.
  useEffect(() => {
    setPlaybackToken(null)
    if (!lesson?.muxPlaybackId) return

    let cancelled = false
    async function loadToken() {
      try {
        const res  = await fetch(`/api/learn/${courseId}/${lesson!.id}/playback-token`)
        const data = await res.json()
        if (!cancelled && data.success) setPlaybackToken(data.data.token as string)
      } catch {
        // Swallow — MuxVideoPlayer just keeps showing its loading state.
      }
    }
    loadToken()
    return () => { cancelled = true }
  }, [courseId, lesson?.id, lesson?.muxPlaybackId])

  // Fetch a fresh signed document URL whenever the current lesson has an
  // in-app document. loadDocumentUrl is also handed to PdfViewer as its
  // "Reload notes" action, for when a long dwell time expires the URL.
  const loadDocumentUrl = useCallback(async () => {
    if (!lesson?.documentKey) return
    try {
      const res  = await fetch(`/api/learn/${courseId}/${lesson.id}/document-url`)
      const data = await res.json()
      if (data.success) setDocumentUrl(data.data.url as string)
    } catch {
      // Swallow — PdfViewer just keeps showing its loading state; the user
      // can still retry via "Reload notes" once a url was set at least once,
      // or this effect retries automatically on the next lesson-dependency change.
    }
  }, [courseId, lesson?.id, lesson?.documentKey])

  useEffect(() => {
    setDocumentUrl(null)
    if (!lesson?.documentKey) return
    loadDocumentUrl()
  }, [loadDocumentUrl, lesson?.documentKey])

  const markComplete = useCallback(async () => {
    // Quiz lessons are never marked complete this way — P5's progress route
    // rejects a direct call for a type === 'QUIZ' lesson (403); completion
    // for those only ever happens via handleQuizResult below, on a pass.
    if (!lesson || completed.has(lesson.id) || marking || lesson.type === 'QUIZ') return
    setMarking(true)
    try {
      const res  = await fetch('/api/progress', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ lessonId: lesson.id, courseId }),
      })
      const data = await res.json()
      if (data.success) {
        setCompleted((prev) => new Set(Array.from(prev).concat(lesson.id)))
        setCompletedCount(data.data.completed)
        setTotal(data.data.total)
        if (data.data.certificateIssued) setCertIssued(true)
      }
    } finally {
      setMarking(false)
    }
  }, [lesson, completed, marking, courseId])

  // Re-pull the authoritative progress numbers. Used after a quiz pass, whose
  // POST /api/quizzes/[quizId]/attempts response carries the completion
  // booleans but not the bar's completed/total counts.
  const refreshProgress = useCallback(async () => {
    try {
      const res  = await fetch(`/api/progress?courseId=${courseId}`)
      const data = await res.json()
      if (data.success) {
        setCompleted(new Set(data.data.completedLessonIds as string[]))
        setCompletedCount(data.data.completed as number)
        setTotal(data.data.total as number)
      }
    } catch {
      // Keep the optimistic state set below — a transient refresh failure
      // shouldn't roll back a pass the user just saw succeed.
    }
  }, [courseId])

  // Fired by QuizPlayer after every submission. Reuses the exact same
  // `completed` set + certificate toast the video/reading markComplete path
  // already drives — no second completion UI.
  const handleQuizResult = useCallback((outcome: QuizAttemptOutcome, quizLessonId: string) => {
    if (outcome.passed) {
      setCompleted((prev) => new Set(Array.from(prev).concat(quizLessonId)))
      refreshProgress()
    }
    if (outcome.certificateCreated) setCertIssued(true)
  }, [refreshProgress])

  // Navigate to adjacent lesson
  function goToLesson(id: string) {
    router.push(`/learn/${courseId}/${id}`)
  }

  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? []
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = allLessons[currentIdx - 1] ?? null
  const nextLesson = allLessons[currentIdx + 1] ?? null

  // Genuine course completion — computed client-side from isRequired/
  // isFinalAssessment (returned by /api/learn/[courseId]) so we also know
  // *which* lesson is still outstanding, not just the count. As of P8.1 the
  // count itself (GET /api/progress `total`) already matches markLessonComplete()
  // via the shared getCourseCompletionCounts() helper, so this derivation and
  // the progress bar now agree; this block stays because it additionally needs
  // the specific outstanding lesson to link to.
  const requiredLessons = allLessons.filter((l) => l.isRequired)
  const courseGenuinelyComplete = requiredLessons.length > 0 && requiredLessons.every((l) => completed.has(l.id))
  const finalAssessmentLesson = allLessons.find((l) => l.isFinalAssessment) ?? null
  const outstandingLesson =
    finalAssessmentLesson && !completed.has(finalAssessmentLesson.id)
      ? finalAssessmentLesson
      : requiredLessons.find((l) => !completed.has(l.id)) ?? null

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-rose-600">{error}</p>
          <Link href="/dashboard" className="text-violet-600 hover:text-violet-700 text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white text-slate-900 flex flex-col overflow-hidden">

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo.png" alt="Qasberrytech logo" width={150} height={38} className="h-7 w-auto" />
          </Link>
          {course && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 text-sm truncate max-w-[200px]">{course.title}</span>
            </>
          )}
        </div>
        <ProgressBar completed={completedCount} total={total} />
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar curriculum */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 border-r border-slate-200 overflow-y-auto bg-[#fafafc]"
            >
              <div className="p-4 space-y-4 min-w-[300px]">
                {course?.modules.map((mod) => (
                  <div key={mod.id} className="space-y-1">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 pb-1">
                      {mod.title}
                    </p>
                    {mod.lessons.map((l) => {
                      const isDone    = completed.has(l.id)
                      const isCurrent = l.id === lessonId
                      return (
                        <button
                          key={l.id}
                          onClick={() => goToLesson(l.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm ${
                            isCurrent
                              ? 'bg-violet-50 text-violet-900 border border-violet-200 font-medium'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          {isDone
                            ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                            : isCurrent
                              ? <Circle size={14} className="text-violet-500 flex-shrink-0" />
                              : <Lock size={14} className="text-slate-400 flex-shrink-0" />
                          }
                          <span className="truncate flex-1">{l.title}</span>
                          {l.duration && (
                            <span className="text-slate-400 text-xs flex-shrink-0">
                              {Math.floor(l.duration / 60)}m
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

            {/* Certificate issued toast */}
            <AnimatePresence>
              {certIssued && (
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50"
                >
                  <Award size={18} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-amber-900 font-semibold text-sm">Certificate earned! 🎉</p>
                    <p className="text-amber-700 text-xs">Find it in your dashboard.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quiz lessons render QuizPlayer instead of the video/document
                content area — mutually exclusive, a lesson is one type. */}
            {lesson?.type === 'QUIZ' ? (
              lesson.quiz && (
                <QuizPlayer
                  quiz={lesson.quiz}
                  onResult={(outcome) => handleQuizResult(outcome, lesson.id)}
                />
              )
            ) : (
              <>
                {/* Video player — only for VIDEO lessons. Mux takes priority once a
                    lesson has been migrated; videoUrl (YouTube/Drive/Vimeo/Loom)
                    remains the fallback for every lesson that hasn't been, and for
                    intentional external embeds. READING lessons have no video to
                    show, so they skip this block entirely rather than showing a
                    "Video not yet available" placeholder that doesn't apply to them. */}
                {lesson?.type === 'VIDEO' && (
                  lesson.muxPlaybackId ? (
                    <MuxVideoPlayer
                      playbackId={lesson.muxPlaybackId}
                      token={playbackToken}
                      title={lesson.title}
                      onEnded={markComplete}
                    />
                  ) : lesson.videoUrl ? (
                    <ExternalVideoPlayer videoUrl={lesson.videoUrl} />
                  ) : (
                    <div className="w-full aspect-video bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Zap size={32} className="mx-auto text-violet-400" />
                        <p className="text-slate-500 text-sm">Video not yet available</p>
                      </div>
                    </div>
                  )
                )}

                {/* Notes / reading material — in-app document viewer takes priority
                    once a lesson has been migrated; pdfUrl (external link) is the
                    fallback for every lesson that hasn't been; pasted/written content
                    (markdown, rendered with formatting) is the
                    fallback for READING lessons with no PDF at all. This renders
                    independently of whichever video player is shown above — a
                    lesson can have both a video and notes. */}
                {lesson?.documentKey ? (
                  <PdfViewer url={documentUrl} onReload={loadDocumentUrl} />
                ) : lesson?.pdfUrl ? (
                  <a
                    href={lesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-blue-700 text-sm font-medium">📄 Open reading material</span>
                    <span className="text-blue-500 text-xs ml-auto">Opens in new tab →</span>
                  </a>
                ) : lesson?.content ? (
                  <Markdown className="text-slate-700 text-sm leading-relaxed px-4 py-4 rounded-2xl border border-slate-200 bg-white">
                    {lesson.content}
                  </Markdown>
                ) : lesson?.type === 'READING' ? (
                  <div className="w-full py-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
                    <p className="text-slate-500 text-sm">Reading content not yet available</p>
                  </div>
                ) : null}
              </>
            )}

            {/* Lesson title + mark complete — quiz lessons are completed by
                passing the quiz above, not this button (P5's progress route
                rejects a direct call for a QUIZ lesson anyway). */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{lesson?.title}</h1>
                {lesson?.duration && (
                  <p className="text-slate-500 text-sm mt-1">
                    {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                  </p>
                )}
              </div>
              {lesson?.type !== 'QUIZ' && (
                <button
                  id="mark-complete-btn"
                  onClick={markComplete}
                  disabled={!lesson || completed.has(lesson.id) || marking}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    lesson && completed.has(lesson.id)
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default'
                      : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50'
                  }`}
                >
                  {lesson && completed.has(lesson.id)
                    ? <><CheckCircle2 size={14} /> Completed</>
                    : <>{marking ? 'Saving…' : 'Mark Complete'}</>
                  }
                </button>
              )}
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {prevLesson ? (
                <button
                  onClick={() => goToLesson(prevLesson.id)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm transition-colors"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
              ) : <div />}

              {nextLesson ? (
                <button
                  onClick={() => { markComplete(); goToLesson(nextLesson.id) }}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Next lesson
                  <ChevronRight size={16} />
                </button>
              ) : courseGenuinelyComplete ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Award size={14} />
                  Finish course
                </Link>
              ) : outstandingLesson ? (
                <button
                  onClick={() => goToLesson(outstandingLesson.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {outstandingLesson.isFinalAssessment ? <Award size={14} /> : <ChevronRight size={14} />}
                  {outstandingLesson.isFinalAssessment ? 'Take final quiz' : `Continue: ${outstandingLesson.title}`}
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Back to Dashboard
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
