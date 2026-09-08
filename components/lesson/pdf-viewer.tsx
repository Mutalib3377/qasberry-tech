'use client'
// components/lesson/pdf-viewer.tsx
// In-app PDF viewer for lesson documents — replaces the old "opens in a new
// tab" Google Drive link for any lesson that has been migrated to
// lesson.documentKey (Supabase Storage). Renders page-by-page via pdfjs-dist
// (never loads the whole document into memory at once — that's inherent to
// this rendering approach, not something built separately).
//
// `url` is a short-lived (10 min) signed Supabase Storage URL, fetched by the
// parent from /api/learn/[courseId]/[lessonId]/document-url. On a long lesson
// dwell time the URL can expire — onReload lets the caller fetch a fresh one
// without a full page refresh.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Download, RefreshCw, FileWarning,
} from 'lucide-react'
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist/types/src/display/api'

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SCALE_STEP = 0.2

interface PdfViewerProps {
  url: string | null // null while the parent is still fetching the signed URL
  onReload: () => void
}

export function PdfViewer({ url, onReload }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const docRef = useRef<PDFDocumentProxy | null>(null)
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)

  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // ── Load the document whenever the signed URL changes ──────────────────
  useEffect(() => {
    if (!url) { setStatus('loading'); return }

    let cancelled = false
    setStatus('loading')

    async function load() {
      try {
        const pdfjs = await import('pdfjs-dist')
        // Next.js's webpack/Terser pass can't bundle the worker file via the
        // usual `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`
        // pattern (a known pdfjs-dist/Next.js interaction — Terser rejects the
        // worker's own `import.meta` usage when webpack tries to process it as
        // a non-module asset). Loading it from a CDN, pinned to the exact
        // version this bundle resolved at runtime, sidesteps bundling it
        // entirely and can't drift out of sync with the installed package.
        pdfjs.GlobalWorkerOptions.workerSrc =
          `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

        const loadingTask = pdfjs.getDocument({ url: url! })
        loadingTaskRef.current = loadingTask
        const doc = await loadingTask.promise
        if (cancelled) { loadingTask.destroy(); return }

        docRef.current = doc
        setNumPages(doc.numPages)
        setPageNum(1)
        setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          console.error('PdfViewer: failed to load document (likely an expired signed URL):', err)
          setStatus('error')
        }
      }
    }
    load()

    return () => {
      cancelled = true
      loadingTaskRef.current?.destroy()
      loadingTaskRef.current = null
      docRef.current = null
    }
  }, [url])

  // ── Render the current page whenever page/scale/doc changes ────────────
  const renderPage = useCallback(async () => {
    const doc = docRef.current
    const canvas = canvasRef.current
    if (!doc || !canvas || status !== 'ready') return

    renderTaskRef.current?.cancel()

    const page = await doc.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    canvas.width = viewport.width
    canvas.height = viewport.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const task = page.render({ canvasContext: ctx, viewport, canvas })
    renderTaskRef.current = task
    try {
      await task.promise
    } catch (err) {
      // A render cancelled by a fast page/zoom change throws — that's expected, not an error.
      if ((err as { name?: string })?.name !== 'RenderingCancelledException') {
        console.error('PdfViewer: render failed:', err)
      }
    }
  }, [pageNum, scale, status])

  useEffect(() => { renderPage() }, [renderPage])

  // ── Fullscreen ───────────────────────────────────────────────────────
  useEffect(() => {
    function onChange() { setIsFullscreen(document.fullscreenElement === containerRef.current) }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current?.requestFullscreen()
    }
  }

  // ── Error / reload state ────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 rounded-xl border border-amber-200 bg-amber-50 text-center">
        <FileWarning size={28} className="text-amber-500" />
        <div>
          <p className="text-amber-900 font-medium text-sm">Couldn&apos;t load these notes.</p>
          <p className="text-amber-700 text-xs mt-0.5">The link may have expired — this happens after a while on the page.</p>
        </div>
        <button
          onClick={onReload}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw size={12} /> Reload notes
        </button>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-slate-200 overflow-hidden bg-slate-100 ${isFullscreen ? 'bg-slate-900 flex flex-col' : ''}`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-200 flex-wrap">
        <button
          onClick={() => setPageNum((p) => Math.max(1, p - 1))}
          disabled={status !== 'ready' || pageNum <= 1}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-slate-500 min-w-[70px] text-center tabular-nums">
          {status === 'ready' ? `Page ${pageNum} of ${numPages}` : 'Loading…'}
        </span>
        <button
          onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
          disabled={status !== 'ready' || pageNum >= numPages}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)))}
          disabled={status !== 'ready'}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-slate-500 min-w-[38px] text-center tabular-nums">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)))}
          disabled={status !== 'ready'}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>

        <div className="flex-1" />

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Download PDF"
            title="Download"
          >
            <Download size={16} />
          </a>
        )}
        <button
          onClick={toggleFullscreen}
          disabled={status !== 'ready'}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Page canvas */}
      <div className={`overflow-auto flex justify-center p-4 ${isFullscreen ? 'flex-1' : 'max-h-[70vh]'}`}>
        {status === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-slate-300" />
              <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 animate-spin" />
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className={status === 'ready' ? 'shadow-lg' : 'hidden'} />
      </div>
    </div>
  )
}
