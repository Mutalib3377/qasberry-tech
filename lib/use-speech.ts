// lib/use-speech.ts
// Read-aloud with the browser's built-in speech synthesis (no audio files, no
// cost). Text is spoken one sentence per utterance: that powers the
// "now reading" highlight and sidesteps Chrome cutting off long utterances.
// Pause cancels and remembers the sentence (speechSynthesis.pause() is
// unreliable across browsers); resume restarts that sentence. Only one
// reader speaks at a time — starting one silences the others.
'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { stripMarkdown } from '@/components/shared/markdown'

export type SpeechState = 'idle' | 'playing' | 'paused'
export const SPEECH_RATES = { normal: 1, slower: 0.8 } as const
export type SpeechRate = keyof typeof SPEECH_RATES

// Some voices spell out ALL-CAPS words letter by letter; speak shouted
// headings in normal case but keep real acronyms
const ACRONYMS = /\b(ai|ml|vr|ar|gpt|llm|ui|3d)\b/gi

function calmCaps(sentence: string): string {
  if (/[a-z]/.test(sentence) || !/[A-Z]{2}/.test(sentence)) return sentence
  const lower = sentence.toLowerCase().replace(ACRONYMS, (m) => m.toUpperCase())
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/** Markdown or plain text → speakable sentences */
export function splitSentences(text: string): string[] {
  // Split lines before stripping: stripMarkdown collapses newlines, which would
  // run a heading (no full stop) straight into the next sentence
  return text
    .split(/\n+/)
    .map((line) => stripMarkdown(line))
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z0-9"“'(])/))
    .map((s) => calmCaps(s.trim()))
    .filter((s) => /[A-Za-z0-9]/.test(s))
}

// One active reader across the page
let activeOwner: string | null = null
const owners = new Map<string, () => void>()

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  const natural = english.find((v) => /natural|google|samantha|aria|jenny|daniel/i.test(v.name))
  return natural ?? english.find((v) => v.default) ?? english[0] ?? null
}

export function useSpeech() {
  const owner = useId()
  const [supported, setSupported] = useState(false)
  const [state, setState] = useState<SpeechState>('idle')
  const [index, setIndex] = useState(-1)
  const [rate, setRateState] = useState<SpeechRate>('normal')

  const sentences = useRef<string[]>([])
  const indexRef = useRef(0)
  const rateRef = useRef<SpeechRate>('normal')
  const run = useRef(0) // bumps on every start/stop so stale callbacks are ignored

  const halt = useCallback(() => {
    run.current++
    if (activeOwner === owner) {
      window.speechSynthesis.cancel()
      activeOwner = null
    }
  }, [owner])

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined')
    // Another reader started: reset this one
    owners.set(owner, () => {
      run.current++
      setState('idle')
      setIndex(-1)
    })
    // Voices load asynchronously in Chrome; touching getVoices() starts it
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices()
    return () => {
      owners.delete(owner)
      halt()
    }
  }, [owner, halt])

  const speakFrom = useCallback(
    (start: number) => {
      const synth = window.speechSynthesis
      if (activeOwner && activeOwner !== owner) owners.get(activeOwner)?.()
      activeOwner = owner
      const current = ++run.current
      synth.cancel()

      const step = (k: number) => {
        if (current !== run.current) return
        if (k >= sentences.current.length) {
          activeOwner = null
          setState('idle')
          setIndex(-1)
          return
        }
        indexRef.current = k
        setIndex(k)
        const utterance = new SpeechSynthesisUtterance(sentences.current[k])
        const voice = pickVoice()
        if (voice) utterance.voice = voice
        utterance.lang = voice?.lang ?? 'en'
        utterance.rate = SPEECH_RATES[rateRef.current]
        utterance.onend = () => step(k + 1)
        utterance.onerror = (e) => {
          // cancel() fires these for the utterance we just stopped
          if (e.error === 'interrupted' || e.error === 'canceled') return
          step(k + 1)
        }
        synth.speak(utterance)
      }

      setState('playing')
      step(start)
    },
    [owner]
  )

  const play = useCallback(
    (text: string) => {
      sentences.current = splitSentences(text)
      if (sentences.current.length) speakFrom(0)
    },
    [speakFrom]
  )

  const pause = useCallback(() => {
    halt()
    setState('paused')
  }, [halt])

  const resume = useCallback(() => speakFrom(indexRef.current), [speakFrom])

  const stop = useCallback(() => {
    halt()
    setState('idle')
    setIndex(-1)
  }, [halt])

  const setRate = useCallback(
    (next: SpeechRate) => {
      rateRef.current = next
      setRateState(next)
      // Apply right away: restart the current sentence at the new speed
      if (state === 'playing') speakFrom(indexRef.current)
    },
    [state, speakFrom]
  )

  return {
    supported,
    state,
    rate,
    currentSentence: index >= 0 ? sentences.current[index] : null,
    play,
    pause,
    resume,
    stop,
    setRate,
  }
}
