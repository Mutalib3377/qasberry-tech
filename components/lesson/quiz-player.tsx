'use client'
// components/lesson/quiz-player.tsx
// Student-facing quiz — instructions, all questions shown at once (short MCQ
// set, per the audit's mockup), submit, immediate pass/fail + score.
//
// P4 scope: this component only talks to /api/quizzes/[quizId]/attempts. It
// does not touch course completion or certificates — passing a quiz here has
// no visible effect on the course's progress bar yet; that wiring is P5.
// Matches the light student-facing design system used in
// app/learn/[courseId]/[lessonId]/page.tsx (violet/emerald/amber accents,
// rounded-2xl cards) rather than the admin dark theme.

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Award, XCircle, RotateCcw, Loader2 } from 'lucide-react'

export interface QuizPlayerData {
  id: string
  title: string
  instructions: string | null
  passingScore: number
  maxAttempts: number | null
  questions: Array<{
    id: string
    prompt: string
    order: number
    points: number
    options: Array<{ id: string; text: string; order: number }>
  }>
}

interface AttemptHistory {
  attemptCount: number
  maxAttempts: number | null
  remaining: number | null
  best: { id: string; score: number; passed: boolean; submittedAt: string } | null
}

interface SubmitResult {
  score: number
  passed: boolean
}

export interface QuizAttemptOutcome {
  passed: boolean
  courseCompleted: boolean
  certificateCreated: boolean
}

interface QuizPlayerProps {
  quiz: QuizPlayerData
  // Fired after every submission (pass or fail) with the completion result —
  // P8 wires this to the lesson page's existing "Mark Complete" / certificate-
  // toast flow. Reusing that flow, not building a second one, is why this is
  // a plain callback rather than the component owning any of that UI itself.
  onResult?: (outcome: QuizAttemptOutcome) => void
}

export function QuizPlayer({ quiz, onResult }: QuizPlayerProps) {
  const [history, setHistory]   = useState<AttemptHistory | null>(null)
  const [loading, setLoading]   = useState(true)
  const [answers, setAnswers]   = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]     = useState<SubmitResult | null>(null)
  const [error, setError]       = useState<string | null>(null)

  async function loadHistory() {
    setLoading(true)
    try {
      const res  = await fetch(`/api/quizzes/${quiz.id}/attempts`)
      const data = await res.json()
      if (data.success) setHistory(data.data as AttemptHistory)
    } catch {
      // Non-fatal — the form still renders; submit will just surface any real error.
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [quiz.id])

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const allAnswered = quiz.questions.every((q) => answers[q.id])

  async function submit() {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Failed to submit quiz')
        return
      }
      setResult({ score: data.data.score, passed: data.data.passed })
      onResult?.({
        passed: data.data.passed,
        courseCompleted: data.data.courseCompleted ?? false,
        certificateCreated: data.data.certificateCreated ?? false,
      })
      await loadHistory()
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  function retake() {
    setResult(null)
    setAnswers({})
    setError(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 animate-spin" />
        </div>
      </div>
    )
  }

  const noAttemptsLeft = history?.remaining === 0

  // ── Result view ──────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="space-y-5">
        <div className={`rounded-2xl border p-8 text-center space-y-4 ${result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          {result.passed ? (
            <Award size={40} className="mx-auto text-emerald-500" />
          ) : (
            <XCircle size={40} className="mx-auto text-amber-500" />
          )}
          <div>
            <p className={`text-3xl font-bold ${result.passed ? 'text-emerald-700' : 'text-amber-700'}`}>{result.score}%</p>
            <p className={`text-sm font-semibold mt-1 ${result.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
              {result.passed ? 'PASS' : 'Not quite — you needed ' + quiz.passingScore + '%'}
            </p>
          </div>

          {!result.passed && (
            <div className="pt-2">
              {history?.remaining === 0 ? (
                <p className="text-amber-700 text-xs">No attempts remaining.</p>
              ) : (
                <>
                  {history?.remaining != null && (
                    <p className="text-amber-700 text-xs mb-3">{history.remaining} attempt{history.remaining === 1 ? '' : 's'} remaining</p>
                  )}
                  <button
                    onClick={retake}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <RotateCcw size={12} /> Retake quiz
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── No attempts remaining (arrived here without just submitting) ───────
  if (noAttemptsLeft && !result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center space-y-2">
        <XCircle size={32} className="mx-auto text-slate-400" />
        <p className="text-slate-700 font-medium text-sm">No attempts remaining</p>
        {history?.best && (
          <p className="text-slate-500 text-xs">Best score: {history.best.score}% ({history.best.passed ? 'Pass' : 'Fail'})</p>
        )}
      </div>
    )
  }

  // ── Quiz form ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{quiz.title}</h2>
        {quiz.instructions && <p className="text-slate-500 text-sm mt-1">{quiz.instructions}</p>}
        <p className="text-slate-400 text-xs mt-1">
          Passing score: {quiz.passingScore}%
          {history?.attemptCount ? ` · Attempt ${history.attemptCount + 1}${history.maxAttempts ? ` of ${history.maxAttempts}` : ''}` : ''}
        </p>
      </div>

      <div className="space-y-5">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-slate-200 p-5 space-y-3">
            <p className="font-medium text-slate-900 text-sm">{qi + 1}. {q.prompt}</p>
            <div className="space-y-2">
              {q.options.map((o) => {
                const selected = answers[q.id] === o.id
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => selectAnswer(q.id, o.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-left text-sm transition-colors ${
                      selected
                        ? 'border-violet-300 bg-violet-50 text-violet-900'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {selected ? <CheckCircle2 size={15} className="text-violet-500 flex-shrink-0" /> : <Circle size={15} className="text-slate-300 flex-shrink-0" />}
                    {o.text}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <button
        onClick={submit}
        disabled={!allAnswered || submitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
        {submitting ? 'Submitting…' : 'Submit Quiz'}
      </button>
    </div>
  )
}
