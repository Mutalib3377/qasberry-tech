'use client'
// components/lesson/quiz-builder.tsx
// Admin quiz editor — create or update the quiz attached to one lesson.
// Standalone/reusable: not wired into any admin page yet (that's P7's job of
// mounting this inside the lesson editor once type === 'QUIZ' is selected).
//
// Mirrors the existing curriculum panel's drag-and-drop pattern
// (components/admin/course-edit-form/index.tsx) — nested @hello-pangea/dnd
// contexts, same input styling, same "expand a row to edit inline" UX.

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import {
  Plus, Trash2, GripVertical, Loader2, Save,
  CheckCircle2, Circle, AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────

interface OptionDraft {
  id?: string
  tempId: string
  text: string
  order: number
  isCorrect: boolean
}

interface QuestionDraft {
  id?: string
  tempId: string
  prompt: string
  order: number
  points: number
  options: OptionDraft[]
}

export interface QuizData {
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
    options: Array<{ id: string; text: string; order: number; isCorrect: boolean }>
  }>
}

interface QuizBuilderProps {
  courseId: string
  moduleId: string
  lessonId: string
  initialQuiz?: QuizData | null
  onSaved?: (quiz: QuizData) => void
}

function genId() {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function emptyOption(order: number): OptionDraft {
  return { tempId: genId(), text: '', order, isCorrect: false }
}

function emptyQuestion(order: number): QuestionDraft {
  return {
    tempId: genId(),
    prompt: '',
    order,
    points: 1,
    options: [emptyOption(0), emptyOption(1)],
  }
}

function fromInitial(quiz?: QuizData | null): {
  title: string; instructions: string; passingScore: number; maxAttempts: number | null; questions: QuestionDraft[]
} {
  if (!quiz) {
    return { title: '', instructions: '', passingScore: 70, maxAttempts: null, questions: [emptyQuestion(0)] }
  }
  return {
    title: quiz.title,
    instructions: quiz.instructions ?? '',
    passingScore: quiz.passingScore,
    maxAttempts: quiz.maxAttempts,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      tempId: genId(),
      prompt: q.prompt,
      order: q.order,
      points: q.points,
      options: q.options.map((o) => ({ id: o.id, tempId: genId(), text: o.text, order: o.order, isCorrect: o.isCorrect })),
    })),
  }
}

// ─── Component ──────────────────────────────────────────────────────────

export function QuizBuilder({ courseId, moduleId, lessonId, initialQuiz, onSaved }: QuizBuilderProps) {
  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors'

  const init = fromInitial(initialQuiz)
  const [title, setTitle] = useState(init.title)
  const [instructions, setInstructions] = useState(init.instructions)
  const [passingScore, setPassingScore] = useState(init.passingScore)
  const [maxAttempts, setMaxAttempts] = useState<number | null>(init.maxAttempts)
  const [questions, setQuestions] = useState<QuestionDraft[]>(init.questions)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedQuiz, setSavedQuiz] = useState<QuizData | null>(initialQuiz ?? null)
  const [keptForHistory, setKeptForHistory] = useState<{ questions: string[]; options: string[] } | null>(null)

  function addQuestion() {
    setQuestions((p) => [...p, emptyQuestion(p.length)])
  }
  function removeQuestion(qi: number) {
    setQuestions((p) => p.filter((_, i) => i !== qi).map((q, i) => ({ ...q, order: i })))
  }
  function updateQuestion(qi: number, patch: Partial<QuestionDraft>) {
    setQuestions((p) => p.map((q, i) => (i === qi ? { ...q, ...patch } : q)))
  }
  function addOption(qi: number) {
    setQuestions((p) => p.map((q, i) => (i === qi && q.options.length < 4 ? { ...q, options: [...q.options, emptyOption(q.options.length)] } : q)))
  }
  function removeOption(qi: number, oi: number) {
    setQuestions((p) => p.map((q, i) => {
      if (i !== qi || q.options.length <= 2) return q
      return { ...q, options: q.options.filter((_, j) => j !== oi).map((o, j) => ({ ...o, order: j })) }
    }))
  }
  function updateOption(qi: number, oi: number, patch: Partial<OptionDraft>) {
    setQuestions((p) => p.map((q, i) => {
      if (i !== qi) return q
      return { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) }
    }))
  }
  // Single-answer MCQ: marking one option correct unsets the others in the same question.
  function markCorrect(qi: number, oi: number) {
    setQuestions((p) => p.map((q, i) => {
      if (i !== qi) return q
      return { ...q, options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })) }
    }))
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    if (result.type === 'QUESTION') {
      const r = Array.from(questions)
      const [removed] = r.splice(result.source.index, 1)
      r.splice(result.destination.index, 0, removed)
      setQuestions(r.map((q, i) => ({ ...q, order: i })))
    }
    if (result.type === 'OPTION') {
      const qi = parseInt(result.source.droppableId.replace('options-', ''))
      setQuestions((p) => p.map((q, i) => {
        if (i !== qi) return q
        const r = Array.from(q.options)
        const [removed] = r.splice(result.source.index, 1)
        r.splice(result.destination!.index, 0, removed)
        return { ...q, options: r.map((o, j) => ({ ...o, order: j })) }
      }))
    }
  }

  const isValid =
    title.trim().length > 0 &&
    passingScore >= 0 && passingScore <= 100 &&
    questions.length > 0 &&
    questions.every((q) => q.prompt.trim().length > 0 && q.options.length >= 2 && q.options.some((o) => o.isCorrect) && q.options.every((o) => o.text.trim().length > 0))

  async function save() {
    if (!isValid) { setError('Fix the highlighted fields before saving.'); return }
    setSaving(true)
    setError(null)
    setKeptForHistory(null)
    const previousQuiz = savedQuiz
    try {
      const payload = {
        title: title.trim(),
        instructions: instructions.trim() || null,
        passingScore,
        maxAttempts,
        questions: questions.map((q) => ({
          ...(q.id ? { id: q.id } : {}),
          prompt: q.prompt.trim(),
          order: q.order,
          points: q.points,
          options: q.options.map((o) => ({
            ...(o.id ? { id: o.id } : {}),
            text: o.text.trim(),
            order: o.order,
            isCorrect: o.isCorrect,
          })),
        })),
      }

      const base = `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz`
      const res = await fetch(base, {
        method: savedQuiz ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json() as {
        success: boolean; error?: string
        data?: QuizData | { quiz: QuizData; keptForHistory: { questionIds: string[]; optionIds: string[] } | null }
      }
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Failed to save quiz')
        return
      }
      const isSyncResponse = data.data && 'quiz' in (data.data as object)
      const quiz = isSyncResponse ? (data.data as { quiz: QuizData }).quiz : (data.data as QuizData)
      const kept = isSyncResponse ? (data.data as { keptForHistory: { questionIds: string[]; optionIds: string[] } | null }).keptForHistory : null

      if (kept && (kept.questionIds.length || kept.optionIds.length) && previousQuiz) {
        // Resolve ids back to readable labels using the shape as it was
        // *before* this save — the removed rows are already gone from the
        // freshly-saved `quiz`, so this is the only place their text is
        // still available.
        const questionLabels = kept.questionIds.map((id) => {
          const q = previousQuiz.questions.find((pq) => pq.id === id)
          return q ? `"${q.prompt}"` : id
        })
        const optionLabels = kept.optionIds.map((id) => {
          for (const q of previousQuiz.questions) {
            const o = q.options.find((po) => po.id === id)
            if (o) return `"${o.text}" (in "${q.prompt}")`
          }
          return id
        })
        setKeptForHistory({ questions: questionLabels, options: optionLabels })
      }

      setSavedQuiz(quiz)
      setQuestions(fromInitial(quiz).questions)
      onSaved?.(quiz)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quiz metadata */}
      <section className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-5">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Quiz Details</h2>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Quiz Title</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Instructions (optional)</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Passing Score (%)</label>
            <input
              type="number" min={0} max={100} className={inputCls}
              value={passingScore}
              onChange={(e) => setPassingScore(Math.min(100, Math.max(0, Number(e.target.value))))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Attempts</label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} className={inputCls}
                placeholder="Unlimited"
                value={maxAttempts ?? ''}
                onChange={(e) => setMaxAttempts(e.target.value ? Math.max(1, Number(e.target.value)) : null)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Questions</h2>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions" type="QUESTION">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {questions.map((q, qi) => (
                  <Draggable key={q.tempId} draggableId={q.tempId} index={qi}>
                    {(drag) => (
                      <div ref={drag.innerRef} {...drag.draggableProps} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <span {...drag.dragHandleProps} className="mt-2.5 text-slate-700 hover:text-slate-500 cursor-grab"><GripVertical size={14} /></span>
                          <div className="flex-1 space-y-2">
                            <input
                              className={inputCls}
                              placeholder={`Question ${qi + 1} prompt…`}
                              value={q.prompt}
                              onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                            />
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-slate-500">Points</label>
                              <input
                                type="number" min={1}
                                className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-violet-500"
                                value={q.points}
                                onChange={(e) => updateQuestion(qi, { points: Math.max(1, Number(e.target.value)) })}
                              />
                            </div>
                          </div>
                          <button onClick={() => removeQuestion(qi)} disabled={questions.length <= 1} className="p-1.5 text-slate-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Options */}
                        <Droppable droppableId={`options-${qi}`} type="OPTION">
                          {(od) => (
                            <div ref={od.innerRef} {...od.droppableProps} className="ml-6 space-y-1.5">
                              {q.options.map((o, oi) => (
                                <Draggable key={o.tempId} draggableId={o.tempId} index={oi}>
                                  {(odrag) => (
                                    <div ref={odrag.innerRef} {...odrag.draggableProps} className="flex items-center gap-2">
                                      <span {...odrag.dragHandleProps} className="text-slate-700 cursor-grab"><GripVertical size={11} /></span>
                                      <button
                                        type="button"
                                        onClick={() => markCorrect(qi, oi)}
                                        title={o.isCorrect ? 'Correct answer' : 'Mark as correct'}
                                        className={o.isCorrect ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}
                                      >
                                        {o.isCorrect ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                                      </button>
                                      <input
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-violet-500"
                                        placeholder={`Option ${oi + 1}…`}
                                        value={o.text}
                                        onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                                      />
                                      <button onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2} className="p-1 text-slate-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {od.placeholder}
                              <button
                                onClick={() => addOption(qi)}
                                disabled={q.options.length >= 4}
                                className="flex items-center gap-1 text-xs text-slate-600 hover:text-violet-400 disabled:opacity-30 py-1 transition-colors"
                              >
                                <Plus size={11} /> Add option
                              </button>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button onClick={addQuestion} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-400 transition-colors">
          <Plus size={14} /> Add question
        </button>
      </section>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5"><AlertCircle size={12} /> {error}</p>
      )}

      {keptForHistory && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
          <p className="text-amber-300 text-xs font-medium flex items-center gap-1.5">
            <AlertCircle size={12} /> Saved — but some items couldn&apos;t be removed
          </p>
          <p className="text-amber-200/80 text-xs">
            These have already been answered by students and are kept for historical accuracy:
          </p>
          <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-0.5">
            {keptForHistory.questions.map((label, i) => (
              <li key={`q-${i}`}>Question {label} — still shown below, remove its options instead if you only want to change answers.</li>
            ))}
            {keptForHistory.options.map((label, i) => (
              <li key={`o-${i}`}>Option {label}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving || !isValid}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {savedQuiz ? 'Update Quiz' : 'Create Quiz'}
        </button>
      </div>
    </div>
  )
}
