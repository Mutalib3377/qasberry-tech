'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Search } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const CHIPS = [
  'Nurse',
  'Lawyer',
  'Teacher',
  'Developer',
  'Marketer',
]

const PLACEHOLDERS = [
  'I am a nurse looking to automate documentation',
  'I am a lawyer exploring AI-powered legal research',
  'I am a teacher building AI-assisted lesson workflows',
  'I am a marketer improving campaigns with AI analytics',
]

export function QasberryBotInput() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [focus, setFocus] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [typedPlaceholder, setTypedPlaceholder] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()

  const filteredChips = useMemo(() => {
    if (!value.trim()) return CHIPS
    const lower = value.toLowerCase()
    return CHIPS.filter((chip) => chip.toLowerCase().includes(lower))
  }, [value])

  useEffect(() => {
    if (reduceMotion) {
      setTypedPlaceholder(PLACEHOLDERS[placeholderIndex])
      return
    }

    const text = PLACEHOLDERS[placeholderIndex]
    setTypedPlaceholder('')
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setTypedPlaceholder(text.slice(0, i))
      if (i >= text.length) window.clearInterval(id)
    }, 28)

    return () => window.clearInterval(id)
  }, [placeholderIndex, reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 4300)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const query = value.trim()
    if (!query || loading) return

    setLoading(true)
    try {
      const res  = await fetch('/api/bot/roadmap', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ careerInput: query }),
      })
      const data = await res.json()
      // Navigate to onboarding page where the full roadmap UI lives
      router.push(`/onboarding?career=${encodeURIComponent(query)}`)
    } catch {
      router.push(`/onboarding?career=${encodeURIComponent(query)}`)
    } finally {
      setLoading(false)
    }
  }

  function fillCareer(label: string) {
    setValue(`I am a ${label.toLowerCase()} looking to use AI in my work`)
    inputRef.current?.focus()
  }

  return (
    <div className="w-full space-y-3">
      <motion.form
        onSubmit={handleSubmit}
        initial={false}
        animate={{
          boxShadow: focus
            ? '0 28px 60px -36px rgba(80,130,255,0.55)'
            : '0 20px 46px -36px rgba(15,23,42,0.4)',
        }}
        transition={{ duration: 0.28 }}
        className="group relative rounded-[28px] border border-slate-200/80 bg-white/80 backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute -inset-px rounded-[28px] bg-[linear-gradient(125deg,rgba(119,99,255,0.34),rgba(61,165,255,0.3),rgba(30,205,234,0.26))] opacity-70 blur-lg" />
        <div className="relative rounded-[28px] bg-white/90 p-2.5 sm:p-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 mb-0.5">
                AI Roadmap Prompt
              </div>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onChange={(e) => setValue(e.target.value)}
                placeholder={typedPlaceholder}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-[13px] sm:text-[15px] text-slate-900 placeholder:text-slate-400 min-w-0"
                aria-label="Describe your profession to generate a roadmap"
              />
            </div>

            <button
              type="submit"
              disabled={!value.trim() || loading}
              className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl bg-[linear-gradient(120deg,#5b5ff7,#4f87ff,#3aa7fb)] text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              <span className="hidden sm:inline">Generate</span>
              {!loading && <ArrowRight size={14} className="hidden sm:inline" />}
            </button>
          </div>
        </div>
      </motion.form>

      <div className="flex flex-wrap justify-center gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => fillCareer(chip)}
            className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-xs sm:text-sm font-medium hover:text-slate-950 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {focus && filteredChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.3)]"
          >
            {filteredChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => fillCareer(chip)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
              >
                I am a {chip.toLowerCase()} learning AI for my daily workflow
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Personalized roadmap in seconds
      </div>
    </div>
  )
}
