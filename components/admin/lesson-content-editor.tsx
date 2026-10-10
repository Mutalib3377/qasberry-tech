'use client'
// components/admin/lesson-content-editor.tsx
// Shared "what is this lesson" editor mounted by both course-form and
// course-edit-form's lesson editors (P7). Replaces the old always-show-
// video-and-pdf-fields layout with a Video / Reading / Quiz type selector
// that conditionally renders the right widget.
//
// Ownership split:
//   - type, videoUrl (paste-link fallback), content — controlled by the
//     parent, included in the parent's existing "Save Lesson" button/PATCH,
//     exactly like videoUrl/pdfUrl already were. Switching the selector
//     alone never discards the other type's fields — they just stay in the
//     parent's state, unsent, until that type is selected and saved.
//   - Video upload, PDF upload, quiz save, final-assessment toggle — each
//     makes its own request immediately (matching the existing upload-on-
//     select design intent from the original audit), and reports resulting
//     lesson fields back up via onLessonFieldsChanged so the parent's
//     curriculum list (checkmarks, etc.) stays in sync without a page reload.

import { useEffect, useRef, useState } from 'react'
import {
  Video, FileText, HelpCircle, Upload, Link as LinkIcon,
  CheckCircle, AlertCircle, Loader2, RefreshCw, Award, X,
} from 'lucide-react'
import { QuizBuilder, type QuizData } from '@/components/lesson/quiz-builder'
import { PdfViewer } from '@/components/lesson/pdf-viewer'
import { RichTextEditor } from '@/components/shared/rich-text-editor'

export type LessonType = 'VIDEO' | 'READING' | 'QUIZ'

export interface LessonFieldsPatch {
  muxAssetId?: string | null
  muxPlaybackId?: string | null
  muxError?: string | null
  documentKey?: string | null
  quizId?: string | null
  type?: LessonType
  isFinalAssessment?: boolean
}

interface LessonContentEditorProps {
  courseId: string
  moduleId: string
  lessonId: string
  isLastLessonInCourse: boolean

  type: LessonType
  onTypeChange: (type: LessonType) => void

  videoUrl: string
  onVideoUrlChange: (url: string) => void
  muxAssetId: string | null
  muxPlaybackId: string | null
  muxError: string | null

  content: string
  onContentChange: (content: string) => void
  documentKey: string | null

  quizId: string | null
  isFinalAssessment: boolean

  onLessonFieldsChanged: (patch: LessonFieldsPatch) => void
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors'

function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

// ─── Type selector ──────────────────────────────────────────────────────

function TypeSelector({ value, onChange }: { value: LessonType; onChange: (t: LessonType) => void }) {
  const options: { value: LessonType; label: string; icon: React.ReactNode }[] = [
    { value: 'VIDEO', label: 'Video', icon: <Video size={14} /> },
    { value: 'READING', label: 'Reading / Notes', icon: <FileText size={14} /> },
    { value: 'QUIZ', label: 'Quiz', icon: <HelpCircle size={14} /> },
  ]
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            value === opt.value
              ? 'border-violet-500 bg-violet-500/15 text-violet-300'
              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
          }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Video widget ───────────────────────────────────────────────────────

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error'

// The browser -> Mux PUT is a direct upload outside our server, so it never
// shows up in our own logs or has a Vercel function timeout to fall back on.
// Plain fetch() has no upload-progress events and no built-in timeout, so a
// stalled connection (flaky wifi, a proxy that silently drops the stream,
// etc.) leaves the promise pending forever — an infinite spinner with no
// error. XHR gives us progress events, which double as a stall detector:
// if no progress arrives for STALL_TIMEOUT_MS, we abort and surface a real
// error instead of hanging.
const STALL_TIMEOUT_MS = 30_000

function putVideoToMux(uploadUrl: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    let stallTimer: ReturnType<typeof setTimeout>

    function resetStallTimer() {
      clearTimeout(stallTimer)
      stallTimer = setTimeout(() => xhr.abort(), STALL_TIMEOUT_MS)
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      resetStallTimer()
    }
    xhr.onload = () => {
      clearTimeout(stallTimer)
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload to Mux failed (status ${xhr.status})`))
    }
    xhr.onerror = () => {
      clearTimeout(stallTimer)
      reject(new Error('Upload to Mux failed — network error'))
    }
    xhr.onabort = () => {
      clearTimeout(stallTimer)
      reject(new Error('Upload stalled — no progress for 30 seconds. Check your connection and try again.'))
    }

    xhr.open('PUT', uploadUrl)
    xhr.send(file)
    resetStallTimer()
  })
}

function VideoWidget({
  courseId, moduleId, lessonId, videoUrl, onVideoUrlChange,
  muxAssetId, muxPlaybackId, muxError, onLessonFieldsChanged,
}: {
  courseId: string; moduleId: string; lessonId: string
  videoUrl: string; onVideoUrlChange: (v: string) => void
  muxAssetId: string | null; muxPlaybackId: string | null; muxError: string | null
  onLessonFieldsChanged: (patch: LessonFieldsPatch) => void
}) {
  const [status, setStatus] = useState<UploadStatus>(
    muxPlaybackId ? 'ready' : muxError ? 'error' : muxAssetId ? 'processing' : 'idle'
  )
  const [errorMsg, setErrorMsg] = useState<string | null>(muxError)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        // Polls the existing, unmodified lesson-list route — no new
        // per-lesson GET route needed for this.
        const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons`)
        const data = await res.json() as { success: boolean; data?: Array<{ id: string; muxPlaybackId: string | null; muxError: string | null }> }
        const lesson = data.data?.find((l) => l.id === lessonId)
        if (!lesson) return
        if (lesson.muxPlaybackId) {
          setStatus('ready')
          onLessonFieldsChanged({ muxPlaybackId: lesson.muxPlaybackId, muxError: null })
          if (pollRef.current) clearInterval(pollRef.current)
        } else if (lesson.muxError) {
          setStatus('error')
          setErrorMsg(lesson.muxError)
          onLessonFieldsChanged({ muxError: lesson.muxError })
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // transient network error — keep polling
      }
    }, 4000)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024 * 1024) { alert('Video must be under 2GB'); return }
    setStatus('uploading')
    setErrorMsg(null)
    setUploadProgress(0)
    try {
      const createRes = await fetch('/api/admin/mux/upload', { method: 'POST' })
      const createData = await createRes.json() as { success: boolean; data?: { uploadId: string; uploadUrl: string }; error?: string }
      if (!createRes.ok || !createData.success || !createData.data) throw new Error(createData.error ?? 'Failed to start upload')
      const { uploadId, uploadUrl } = createData.data

      // Browser -> Mux directly. Never routed through our own server.
      await putVideoToMux(uploadUrl, file, setUploadProgress)

      // Resolve upload -> asset id (can take a few seconds after the PUT completes).
      let confirmed = false
      for (let i = 0; i < 20 && !confirmed; i++) {
        await new Promise((r) => setTimeout(r, 1500))
        const confirmRes = await fetch(`/api/admin/mux/upload/${uploadId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId }),
        })
        if (confirmRes.ok) {
          const confirmData = await confirmRes.json() as { success: boolean; data?: { muxAssetId: string } }
          if (confirmData.success && confirmData.data) {
            onLessonFieldsChanged({ muxAssetId: confirmData.data.muxAssetId, muxPlaybackId: null, muxError: null, type: 'VIDEO' })
            confirmed = true
          }
        }
        // A 409 here means Mux hasn't resolved the asset id yet — keep retrying.
      }
      if (!confirmed) throw new Error('Mux is taking longer than expected to accept the upload — refresh and check back shortly.')

      setStatus('processing')
      startPolling()
    } catch (err) {
      setStatus('error')
      setErrorMsg((err as Error).message)
    } finally {
      setUploadProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const videoUrlValid = !videoUrl || isValidUrl(videoUrl)

  return (
    <div className="space-y-5">
      {/* Upload */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <Video size={12} className="text-violet-400" /> Upload video (Mux)
        </p>

        {status === 'idle' && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full py-8 rounded-xl border-2 border-dashed border-slate-700 hover:border-violet-500/50 text-slate-500 hover:text-slate-400 transition-colors gap-2 text-sm"
          >
            <Upload size={20} />
            <span>Click to upload a video file</span>
            <span className="text-xs text-slate-600">MP4, MOV, or any Mux-supported format</span>
          </button>
        )}

        {status === 'uploading' && (
          <div className="flex items-center gap-3 px-4 py-4 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-300 text-sm">
            <Loader2 size={16} className="animate-spin text-violet-400" />
            Uploading to Mux{uploadProgress !== null ? `… ${uploadProgress}%` : '…'}
          </div>
        )}

        {status === 'processing' && (
          <div className="flex items-center gap-3 px-4 py-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
            <Loader2 size={16} className="animate-spin text-amber-400" /> Processing — this can take a minute or two…
          </div>
        )}

        {status === 'ready' && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">
            <span className="flex items-center gap-2"><CheckCircle size={15} /> Video ready</span>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-emerald-200 hover:text-white underline">
              Replace
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Video processing failed</p>
                <p className="text-red-300/80 text-xs mt-0.5">{errorMsg ?? 'Unknown error'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 transition-colors"
            >
              <RefreshCw size={11} /> Try a different file
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
      </div>

      {/* External link fallback — legitimate use case (YouTube embeds), not just a migration artifact */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <LinkIcon size={12} className="text-slate-500" /> Or paste an external link
        </p>
        <input
          className={`${inputCls} text-xs ${videoUrl && !videoUrlValid ? 'border-red-500/60' : ''}`}
          placeholder="YouTube, Google Drive, Vimeo or Loom URL…"
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
        />
        <p className="text-xs text-slate-700 mt-1">Used only if no Mux video is uploaded above.</p>
      </div>
    </div>
  )
}

// ─── Reading widget ─────────────────────────────────────────────────────

function ReadingWidget({
  courseId, moduleId, lessonId, content, onContentChange, documentKey, onLessonFieldsChanged,
}: {
  courseId: string; moduleId: string; lessonId: string
  content: string; onContentChange: (c: string) => void
  documentKey: string | null
  onLessonFieldsChanged: (patch: LessonFieldsPatch) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadPreview() {
    if (!documentKey) { setPreviewUrl(null); return }
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/document`)
      const data = await res.json() as { success: boolean; data?: { url: string } }
      if (data.success && data.data) setPreviewUrl(data.data.url)
    } catch {
      setPreviewUrl(null)
    }
  }

  useEffect(() => { loadPreview() }, [documentKey])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { alert('Only PDF files are supported'); return }
    if (file.size > 20 * 1024 * 1024) { alert('PDF must be under 20MB'); return }
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/document`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json() as { success: boolean; data?: { documentKey: string }; error?: string }
      if (!res.ok || !data.success || !data.data) throw new Error(data.error ?? 'Upload failed')
      onLessonFieldsChanged({ documentKey: data.data.documentKey, type: 'READING' })
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemove() {
    if (!confirm('Remove this PDF? Students will no longer be able to view it.')) return
    setRemoving(true)
    setUploadError(null)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/document`, {
        method: 'DELETE',
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to remove document')
      onLessonFieldsChanged({ documentKey: null })
      setPreviewUrl(null)
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Content (optional)</label>
        <RichTextEditor
          rows={12}
          placeholder="Write or paste the lesson's reading content here…"
          value={content}
          onChange={onContentChange}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <FileText size={12} className="text-blue-400" /> PDF notes
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || removing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-700 hover:border-violet-500/50 text-slate-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? 'Uploading…' : documentKey ? 'Replace PDF' : 'Upload PDF'}
          </button>
          {documentKey && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading || removing}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-900/50 hover:border-red-500/50 text-red-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {removing ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              {removing ? 'Removing…' : 'Remove PDF'}
            </button>
          )}
        </div>
        {uploadError && <p className="text-xs text-red-400 mt-1.5">{uploadError}</p>}
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
      </div>

      {/* Inline preview — the real student-facing PdfViewer, not a reimplementation */}
      {documentKey && (
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Preview (what students will see)</p>
          <PdfViewer url={previewUrl} onReload={loadPreview} />
        </div>
      )}
    </div>
  )
}

// ─── Final assessment toggle ────────────────────────────────────────────

function FinalAssessmentToggle({
  courseId, moduleId, lessonId, isLastLessonInCourse, isFinalAssessment, onLessonFieldsChanged,
}: {
  courseId: string; moduleId: string; lessonId: string
  isLastLessonInCourse: boolean; isFinalAssessment: boolean
  onLessonFieldsChanged: (patch: LessonFieldsPatch) => void
}) {
  const [expanded, setExpanded] = useState(isLastLessonInCourse || isFinalAssessment)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setSaving(true)
    setError(null)
    try {
      const url = `/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/final-assessment`
      const res = await fetch(url, { method: isFinalAssessment ? 'DELETE' : 'POST' })
      const data = await res.json() as { success: boolean; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Failed to update')
        return
      }
      onLessonFieldsChanged({ isFinalAssessment: !isFinalAssessment })
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  if (!expanded) {
    return (
      <button type="button" onClick={() => setExpanded(true)} className="text-xs text-slate-600 hover:text-violet-400 transition-colors">
        Advanced: mark as final assessment…
      </button>
    )
  }

  return (
    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
      <label className="flex items-center gap-3 cursor-pointer" onClick={toggle}>
        <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${isFinalAssessment ? 'bg-amber-500' : 'bg-slate-700'} ${saving ? 'opacity-50' : ''}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isFinalAssessment ? 'translate-x-5' : ''}`} />
        </div>
        <span className="flex items-center gap-1.5 text-sm text-amber-200 font-medium">
          <Award size={14} /> Final Assessment
        </span>
        {saving && <Loader2 size={12} className="animate-spin text-amber-400" />}
      </label>
      <p className="text-xs text-amber-200/70 pl-[52px]">
        Students must pass this quiz to complete the course and unlock their certificate.
        Only one lesson per course can be flagged — flagging this one will unflag any other.
      </p>
      {error && <p className="text-xs text-red-400 pl-[52px]">{error}</p>}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────

export function LessonContentEditor(props: LessonContentEditorProps) {
  const {
    courseId, moduleId, lessonId, isLastLessonInCourse,
    type, onTypeChange,
    videoUrl, onVideoUrlChange, muxAssetId, muxPlaybackId, muxError,
    content, onContentChange, documentKey,
    quizId, isFinalAssessment,
    onLessonFieldsChanged,
  } = props

  const [initialQuiz, setInitialQuiz] = useState<QuizData | null | undefined>(undefined) // undefined = loading

  useEffect(() => {
    if (type !== 'QUIZ') return
    if (!quizId) { setInitialQuiz(null); return }
    let cancelled = false
    fetch(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz`)
      .then((r) => r.json())
      .then((data: { success: boolean; data?: QuizData }) => {
        if (!cancelled) setInitialQuiz(data.success ? data.data ?? null : null)
      })
      .catch(() => { if (!cancelled) setInitialQuiz(null) })
    return () => { cancelled = true }
  }, [type, quizId, courseId, moduleId, lessonId])

  // Guards against silently orphaning already-built content: each widget
  // (video upload, quiz builder, document upload) persists its own type's
  // fields to the DB immediately, independent of the parent's "Save Lesson"
  // button — but that Save button always writes whatever `type` is *currently
  // selected*, with no memory of what used to be selected. Switch tabs away
  // from a type that already has real content and hit Save, and the lesson's
  // `type` silently flips while quizId/muxAssetId/documentKey are left behind,
  // unreferenced by the now-different type — the content still exists, the
  // lesson just stops showing it. Confirming here is a UI-only speed bump;
  // it changes nothing server-side and nothing about the fields' own APIs.
  function handleTypeChange(newType: LessonType) {
    if (newType === type) return
    const hasBuiltContent =
      (type === 'QUIZ' && !!quizId) ||
      (type === 'VIDEO' && !!(muxPlaybackId || muxAssetId)) ||
      (type === 'READING' && !!documentKey)
    if (hasBuiltContent) {
      const ok = window.confirm(
        `This lesson already has a ${type.toLowerCase()} built. Switching to ${newType} ` +
        `will stop students from seeing that ${type.toLowerCase()} — its content isn't deleted, ` +
        `so switching back later restores it. Continue?`
      )
      if (!ok) return
    }
    onTypeChange(newType)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Lesson Type</label>
        <TypeSelector value={type} onChange={handleTypeChange} />
      </div>

      {type === 'VIDEO' && (
        <VideoWidget
          courseId={courseId} moduleId={moduleId} lessonId={lessonId}
          videoUrl={videoUrl} onVideoUrlChange={onVideoUrlChange}
          muxAssetId={muxAssetId} muxPlaybackId={muxPlaybackId} muxError={muxError}
          onLessonFieldsChanged={onLessonFieldsChanged}
        />
      )}

      {type === 'READING' && (
        <ReadingWidget
          courseId={courseId} moduleId={moduleId} lessonId={lessonId}
          content={content} onContentChange={onContentChange}
          documentKey={documentKey}
          onLessonFieldsChanged={onLessonFieldsChanged}
        />
      )}

      {type === 'QUIZ' && (
        initialQuiz === undefined ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-6 justify-center">
            <Loader2 size={14} className="animate-spin" /> Loading quiz…
          </div>
        ) : (
          <QuizBuilder
            courseId={courseId} moduleId={moduleId} lessonId={lessonId}
            initialQuiz={initialQuiz}
            onSaved={(quiz) => onLessonFieldsChanged({ quizId: quiz.id, type: 'QUIZ' })}
          />
        )
      )}

      {type === 'QUIZ' && quizId && (
        <FinalAssessmentToggle
          courseId={courseId} moduleId={moduleId} lessonId={lessonId}
          isLastLessonInCourse={isLastLessonInCourse}
          isFinalAssessment={isFinalAssessment}
          onLessonFieldsChanged={onLessonFieldsChanged}
        />
      )}
    </div>
  )
}
