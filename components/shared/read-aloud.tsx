'use client'
// components/shared/read-aloud.tsx
// "Listen" controls for young and pre-readers (UX gaps #09). Two shapes:
//   <ReadAloud text=… />           full bar: Listen/Pause, Slower/Normal speed,
//                                   Stop, and a caption showing the sentence
//                                   being read (keeps the lesson's own
//                                   formatting untouched)
//   <ReadAloud variant="icon" … /> compact speaker button (quiz questions)
// Hidden when the browser has no speech synthesis or Reading help is off.
// Uses brand-* tokens, so it follows the robotics theme on marketing pages
// and stays light on lesson pages.

import { Pause, Play, Square, Turtle, Volume2, VolumeX } from 'lucide-react'
import { useReadingHelp } from '@/lib/reading-help'
import { useSpeech } from '@/lib/use-speech'

// Skip reading the title when the text already starts with a heading or
// with the same words (avoids "Reading. Lesson 1: …" and doubled titles)
function opensWithTitle(text: string, title: string): boolean {
  const firstLine = text.trim().split('\n')[0] ?? ''
  if (/^\s{0,3}#{1,6}\s/.test(firstLine)) return true
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return norm(firstLine).startsWith(norm(title))
}

export function ReadAloud({
  text,
  title,
  variant = 'bar',
  label = 'Listen',
}: {
  /** Markdown or plain text to read */
  text: string
  /** Read first, e.g. the lesson title */
  title?: string
  variant?: 'bar' | 'icon'
  label?: string
}) {
  const readingHelp = useReadingHelp()
  const speech = useSpeech()
  if (!speech.supported || !readingHelp) return null

  const fullText = title && !opensWithTitle(text, title) ? `${title}.\n${text}` : text
  const active = speech.state !== 'idle'

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => (active ? speech.stop() : speech.play(fullText))}
        aria-label={active ? 'Stop reading' : label}
        title={active ? 'Stop reading' : label}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
          active
            ? 'border-brand-purple bg-brand-purple text-white'
            : 'border-brand-border bg-brand-purple-soft text-brand-purple hover:border-brand-purple/40'
        }`}
      >
        {active ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-purple-subtle p-3" role="group" aria-label="Read aloud">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            speech.state === 'playing' ? speech.pause() : speech.state === 'paused' ? speech.resume() : speech.play(fullText)
          }
          className="inline-flex items-center gap-2 rounded-xl bg-brand-purple px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-purple-hover"
        >
          {speech.state === 'playing' ? <Pause size={16} /> : speech.state === 'paused' ? <Play size={16} /> : <Volume2 size={16} />}
          {speech.state === 'playing' ? 'Pause' : speech.state === 'paused' ? 'Resume' : label}
        </button>

        <button
          type="button"
          onClick={() => speech.setRate(speech.rate === 'slower' ? 'normal' : 'slower')}
          aria-pressed={speech.rate === 'slower'}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
            speech.rate === 'slower'
              ? 'border-brand-purple/40 bg-brand-purple-soft text-brand-purple'
              : 'border-brand-border text-brand-secondary hover:text-brand-charcoal'
          }`}
        >
          <Turtle size={16} />
          Slower
        </button>

        {active && (
          <button
            type="button"
            onClick={speech.stop}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-3 py-2 text-sm font-medium text-brand-secondary transition-colors hover:text-brand-charcoal"
          >
            <Square size={14} />
            Stop
          </button>
        )}
      </div>

      {/* Caption: the sentence being read. Not aria-live, so screen readers
          don't talk over the speech. */}
      {active && speech.currentSentence && (
        <p className="mt-3 rounded-xl bg-white p-3 text-base leading-relaxed text-brand-charcoal dark:bg-rx-chip-strong">
          <mark className="rounded bg-amber-100 px-1 text-brand-charcoal [box-decoration-break:clone] dark:bg-amber-500/25">
            {speech.currentSentence}
          </mark>
        </p>
      )}
    </div>
  )
}
