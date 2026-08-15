'use client'
// app/onboarding/page.tsx
// AI Roadmap bot — unified light design system.
// User enters their career; AI returns a personalised 8-step roadmap.

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, Loader2, RotateCcw, CheckCircle2,
  BookOpen, Wrench, Bot, Database, MessageSquare,
  TrendingUp, Shield, Palette, Lock, Zap,
} from 'lucide-react'
import type { Roadmap, RoadmapSkillTag } from '@/types'
import { AppShell } from '@/components/shared/AppShell'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'

// Skill tag metadata - light theme palette 
const TAG_META: Record<RoadmapSkillTag, { color: string; icon: React.ReactNode; label: string }> = {
  fundamentals:  { color: 'bg-violet-50 text-violet-700 border-violet-200',   icon: <CheckCircle2 size={12} />, label: 'Fundamentals' },
  tools:         { color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: <Wrench size={12} />,       label: 'Tools' },
  automation:    { color: 'bg-cyan-50 text-cyan-700 border-cyan-200',         icon: <Bot size={12} />,           label: 'Automation' },
  data:          { color: 'bg-emerald-50 text-emerald-700 border-emerald-200',icon: <Database size={12} />,     label: 'Data' },
  communication: { color: 'bg-sky-50 text-sky-700 border-sky-200',            icon: <MessageSquare size={12} />,label: 'Communication' },
  strategy:      { color: 'bg-amber-50 text-amber-700 border-amber-200',      icon: <TrendingUp size={12} />,   label: 'Strategy' },
  safety:        { color: 'bg-rose-50 text-rose-700 border-rose-200',         icon: <Shield size={12} />,       label: 'Safety' },
  creativity:    { color: 'bg-pink-50 text-pink-700 border-pink-200',         icon: <Palette size={12} />,      label: 'Creativity' },
}

// Suggestion pills 
const SUGGESTIONS = [
  'Nurse', 'Lawyer', 'Teacher', 'Civil Engineer',
  'Accountant', 'Social Worker', 'Pharmacist', 'HR Manager',
]

// Step card component 
function StepCard({ step, index }: { step: Roadmap['steps'][number]; index: number }) {
  const meta = TAG_META[step.skillTag] ?? TAG_META.fundamentals
  const hasCourse = !!step.courseId
  const priceLabel = step.isFree
    ? 'Free'
    : step.price != null && Number(step.price) > 0
      ? `$${Number(step.price).toLocaleString()}`
      : null

  const inner = (
    <Card
      variant={hasCourse ? 'interactive' : 'default'}
      className="group relative flex gap-4 p-5"
    >
      {/* Step number */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-purple-soft border border-brand-purple/20 flex items-center justify-center">
        <span className="text-brand-purple text-sm font-bold">{String(step.order).padStart(2, '0')}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-brand-charcoal font-bold text-base leading-snug">{step.title}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {priceLabel && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                step.isFree
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {step.isFree ? <Zap size={10} /> : <Lock size={10} />}
                {priceLabel}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${meta.color}`}>
              {meta.icon}
              {meta.label}
            </span>
          </div>
        </div>
        <p className="text-brand-secondary text-sm leading-relaxed">{step.description}</p>
        {hasCourse && (
          <p className="text-brand-purple text-xs font-semibold group-hover:text-brand-purple-hover transition-colors flex items-center gap-1">
            Start course <ArrowRight size={12} />
          </p>
        )}
      </div>
    </Card>
  )

  if (hasCourse && step.courseId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.06 }}
      >
        <Link href={`/courses/${step.courseSlug ?? step.courseId}`}>
          {inner}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      {inner}
    </motion.div>
  )
}

// Main page 
export default function OnboardingPage() {
  const searchParams  = useSearchParams()
  const [careerInput, setCareerInput] = useState(() => searchParams.get('career') ?? '')
  const [loading,     setLoading]     = useState(false)
  const [roadmap,     setRoadmap]     = useState<Roadmap | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    const pre = searchParams.get('career')
    if (pre) generateRoadmap(pre)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generateRoadmap(career?: string) {
    const input = (career ?? careerInput).trim()
    if (!input) return
    if (!career) setCareerInput(input)

    setLoading(true)
    setError(null)
    setRoadmap(null)

    try {
      const res  = await fetch('/api/bot/roadmap', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ careerInput: input }),
      })
      const data = await res.json() as { success: boolean; data?: Roadmap; error?: string }

      if (data.success && data.data) {
        setRoadmap(data.data)
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setRoadmap(null)
    setError(null)
    setCareerInput('')
  }

  return (
    <AppShell backHref="/dashboard" backLabel="Dashboard">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">

        {/* Input phase */}
        <AnimatePresence mode="wait">
          {!roadmap && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-3">
                <Badge variant="primary" className="px-3.5 py-1">
                  AI Roadmap Generator
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight leading-tight">
                  What&apos;s your career?
                </h1>
                <p className="text-brand-secondary text-base leading-relaxed">
                  Tell us your profession and we&apos;ll instantly build a personalized AI learning roadmap tailored to your field.
                </p>
              </div>

              {/* Input */}
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    id="career-input"
                    value={careerInput}
                    onChange={(e) => setCareerInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') generateRoadmap() }}
                    placeholder="e.g. Pediatric Nurse, Family Lawyer, Teacher…"
                    disabled={loading}
                    className="pr-14 py-3 text-base rounded-2xl"
                    leftIcon={<Bot size={18} />}
                  />
                  <button
                    id="generate-roadmap-btn"
                    onClick={() => generateRoadmap()}
                    disabled={loading || !careerInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-brand-purple hover:bg-brand-purple-hover disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-colors"
                  >
                    {loading
                      ? <Loader2 size={16} className="animate-spin" />
                      : <ArrowRight size={16} />
                    }
                  </button>
                </div>

                {/* Suggestion pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setCareerInput(s); generateRoadmap(s) }}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-full border border-brand-border bg-white hover:bg-brand-purple-soft hover:border-brand-purple/30 text-brand-secondary hover:text-brand-purple text-xs font-medium transition-all disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-brand-purple-soft" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-brand-purple animate-spin" />
                    <div className="absolute inset-2.5 rounded-full bg-brand-purple-soft flex items-center justify-center">
                      <Bot size={16} className="text-brand-purple" />
                    </div>
                  </div>
                  <div>
                    <p className="text-brand-charcoal font-semibold">Analyzing your career…</p>
                    <p className="text-brand-secondary text-sm mt-0.5">Our AI is mapping your personalized learning steps</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Roadmap phase */}
          {roadmap && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Roadmap header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <Badge variant="primary" className="px-3.5 py-1">
                    Personalized AI Roadmap
                  </Badge>
                  <button
                    id="reset-roadmap-btn"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-brand-secondary hover:text-brand-charcoal text-sm font-medium transition-colors"
                  >
                    <RotateCcw size={13} />
                    Try another career
                  </button>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight">
                  AI Roadmap for{' '}
                  <span className="gradient-text">
                    {roadmap.career}
                  </span>
                </h1>
                <p className="text-brand-secondary text-base leading-relaxed">{roadmap.summary}</p>
              </motion.div>

              {/* Steps or empty state */}
              {roadmap.steps.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-tertiary uppercase tracking-wider -mb-1">
                    <BookOpen size={13} />
                    <span>{roadmap.steps.length} learning step{roadmap.steps.length !== 1 ? 's' : ''} mapped to your goal</span>
                  </div>
                  <div className="space-y-4">
                    {roadmap.steps.map((step, i) => (
                      <StepCard key={step.order} step={step} index={i} />
                    ))}
                  </div>

                  {/* CTA after roadmap */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card variant="featured" className="p-7 text-center space-y-3">
                      <div className="flex items-center justify-center gap-2 text-brand-purple">
                        <BookOpen size={20} />
                        <span className="font-bold text-base">Ready to build your AI edge?</span>
                      </div>
                      <p className="text-brand-secondary text-sm max-w-md mx-auto">
                        Enroll in any matched course above or track all your learning from your Qasberry dashboard.
                      </p>
                      <div className="pt-2">
                        <Link id="browse-courses-btn" href="/dashboard">
                          <Button variant="primary">
                            Go to my dashboard <ArrowRight size={15} />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                </>
              ) : (
                /* No steps returned */
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-purple-soft flex items-center justify-center mx-auto text-brand-purple">
                      <BookOpen size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-brand-charcoal font-bold text-lg">No exact courses matched yet</h3>
                      <p className="text-brand-secondary text-sm max-w-sm mx-auto">
                        {roadmap.summary}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <Button variant="secondary" size="sm" onClick={reset}>
                        <RotateCcw size={13} /> Try another career
                      </Button>
                      <Link href="/dashboard">
                        <Button variant="primary" size="sm">
                          Go to dashboard <ArrowRight size={13} />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
