'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  Brain,
  BriefcaseBusiness,
  ChartColumnIncreasing,
  ChartNoAxesColumnIncreasing,
  FileBadge,
  GraduationCap,
  Search,
  Smile,
} from 'lucide-react'
import { VISIBLE_AUDIENCES, type AudienceKey } from './audiences'

// Placeholder cropped from the design mockup — swap for the final artwork.
const HERO_ILLUSTRATION_SRC = '/hero-banner.png'

const BENEFITS = [
  { label: 'Learn with AI', icon: GraduationCap },
  { label: 'Build Skills',  icon: ChartNoAxesColumnIncreasing },
  { label: 'Get Certified', icon: FileBadge },
]

const AUDIENCE_TILES: Record<AudienceKey, { blurb: string; icon: typeof Smile; tile: string }> = {
  kids: {
    blurb: 'Learn, explore and grow with AI.',
    icon: Smile,
    tile: 'border-indigo-100 bg-[linear-gradient(135deg,#f3f6ff,#eef2ff)] hover:border-indigo-300',
  },
  sales: {
    blurb: 'Learn, build and advance with AI.',
    icon: BriefcaseBusiness,
    tile: 'border-violet-100 bg-[linear-gradient(135deg,#f8f4ff,#f1ebff)] hover:border-violet-300',
  },
}

function FloatingCard({
  children,
  className,
  rotate,
  delay,
}: {
  children: React.ReactNode
  className: string
  rotate: number
  delay: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.6, delay }}
      className={`absolute hidden xl:block ${className}`}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5 + delay * 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ rotate }}
        className="rounded-2xl border border-white bg-white/90 backdrop-blur-md px-4 py-3.5 shadow-[0_18px_40px_-24px_rgba(49,46,129,0.35)]"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function IconBubble({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div
      className={`absolute hidden xl:flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_14px_30px_-12px_rgba(79,70,229,0.6)] ${className}`}
    >
      {children}
    </div>
  )
}

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const single = VISIBLE_AUDIENCES.length === 1
  const router = useRouter()
  const [query, setQuery] = useState('')
  const sectionRef = useRef<HTMLElement>(null)

  function scrollToContent() {
    const next = sectionRef.current?.nextElementSibling
    if (!next) return
    // Offset so the fixed marketing nav doesn't cover the section heading
    const NAV_OFFSET = 48
    window.scrollTo({
      top: next.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses')
  }

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.55, delay },
  })

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#fbfdfe_0%,#f6f8fe_40%,#eef2fd_72%,#ffffff_100%)] pt-28 sm:pt-32"
    >
      {/* Soft background shapes */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-[38%] -left-40 h-[520px] w-[620px] rounded-full bg-[radial-gradient(ellipse,rgba(199,210,254,0.45),transparent_68%)]" />
        <div className="absolute top-[34%] -right-40 h-[520px] w-[620px] rounded-full bg-[radial-gradient(ellipse,rgba(221,214,254,0.45),transparent_68%)]" />
        <div className="absolute top-[34%] right-[6%] hidden xl:block h-14 w-14 rounded-full bg-indigo-100/50" />
      </div>

      {/* Connector curves between the floating cards and the illustration */}
      <svg
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto hidden xl:block h-full w-full max-w-[1536px]"
        viewBox="0 0 1536 1024"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
        aria-hidden
      >
        <path d="M216 602 C 230 680, 330 715, 412 725" stroke="#a5b4fc" strokeWidth="1.5" />
        <circle cx="216" cy="602" r="4" fill="#6366f1" />
        <circle cx="412" cy="725" r="4" fill="#818cf8" />
        <circle cx="304" cy="798" r="6" fill="#a5b4fc" />
        <path d="M1212 576 C 1210 650, 1120 700, 1050 722" stroke="#a5b4fc" strokeWidth="1.5" />
        <circle cx="1212" cy="576" r="4" fill="#6366f1" />
        <path d="M1290 812 C 1240 830, 1180 840, 1130 845" stroke="#c4b5fd" strokeWidth="1.5" />
      </svg>

      {/* Floating cards (large screens only) */}
      <FloatingCard className="left-[8.5%] top-[49%]" rotate={4} delay={0.5}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Brain size={22} />
          </span>
          <span className="text-sm font-medium leading-tight text-slate-800">Build<br />Real Skills</span>
        </div>
      </FloatingCard>
      <IconBubble className="left-[20%] top-[62%] bg-[linear-gradient(135deg,#6366f1,#3b82f6)]">
        <GraduationCap size={24} />
      </IconBubble>

      <FloatingCard className="right-[9.5%] top-[46%]" rotate={-6} delay={0.6}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <ChartColumnIncreasing size={22} />
          </span>
          {/* MVP: original — "Grow Your Career" */}
          <span className="text-sm font-medium leading-tight text-slate-800">Create<br />with AI</span>
        </div>
      </FloatingCard>
      <FloatingCard className="right-[6.5%] top-[60%]" rotate={-6} delay={0.75}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <FileBadge size={22} />
          </span>
          <span className="text-sm font-medium leading-tight text-slate-800">Earn Your<br />Certificate</span>
          <Award size={26} className="ml-2 text-indigo-500" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-28 rounded-full bg-slate-100" />
          <div className="h-1.5 w-20 rounded-full bg-slate-100" />
        </div>
      </FloatingCard>
      <IconBubble className="right-[12.5%] top-[75%] bg-[linear-gradient(135deg,#a78bfa,#7c3aed)]">
        <ChartNoAxesColumnIncreasing size={24} />
      </IconBubble>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <motion.div {...fadeUp(0)} className="inline-block">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white py-1 pl-1 pr-4 text-sm font-medium text-[#0f1535] shadow-[0_4px_14px_-6px_rgba(15,23,42,0.18)] hover:border-slate-300 hover:shadow-[0_6px_18px_-6px_rgba(15,23,42,0.24)] transition-all"
          >
            <span className="rounded-full bg-[linear-gradient(90deg,#f472b6,#c084fc)] px-3 py-1 text-[13px] font-semibold text-white">
              New
            </span>
            AI Learning for a Brighter Future
            <ArrowUpRight size={16} className="text-slate-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.h1
          {...fadeUp(0.06)}
          className="mt-5 text-[2.5rem] leading-[1.08] sm:text-6xl lg:text-[4.25rem] font-extrabold tracking-[-0.03em] text-[#0f1535]"
        >
          Learn to Leverage AI
          <br />
          <span className="bg-[linear-gradient(100deg,#7c3aed_0%,#4f46e5_45%,#3b5bdb_100%)] bg-clip-text text-transparent">
            for Your Goals
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.12)} className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-600">
          {/* MVP: original — "Practical courses for Kids & Youth and Sales & Marketing professionals." */}
          Fun, safe AI courses for Youth, with guides for parents and teachers.
        </motion.p>

        <motion.ul
          {...fadeUp(0.18)}
          className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:divide-x sm:divide-slate-200"
        >
          {BENEFITS.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-3 sm:pl-6 first:pl-0">
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Icon size={22} />
              </span>
              <span className="text-sm sm:text-[15px] font-medium text-slate-800">{label}</span>
            </li>
          ))}
        </motion.ul>

        <motion.div
          {...fadeUp(0.26)}
          className="relative z-10 mx-auto mt-8 max-w-[680px] rounded-3xl border border-white bg-white/90 backdrop-blur-xl p-4 sm:p-5 shadow-[0_30px_70px_-40px_rgba(49,46,129,0.35)]"
        >
          <h2 className="text-lg sm:text-xl font-bold text-[#0f1535]">
            {single ? 'Start exploring' : 'What are you here for?'}
          </h2>

          <div className={`mt-4 grid gap-3 ${single ? '' : 'sm:grid-cols-2'}`}>
            {VISIBLE_AUDIENCES.map((audience) => {
              const tile = AUDIENCE_TILES[audience.key]
              const Icon = tile.icon
              return (
                <Link
                  key={audience.key}
                  href={audience.href}
                  className={`group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${tile.tile}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm">
                    <Icon size={24} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-[#0f1535]">{audience.name}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{tile.blurb}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-indigo-600 transition-transform group-hover:translate-x-1" />
                </Link>
              )
            })}
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-4 flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-4 pr-1.5 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition"
          >
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to learn? (e.g. AI art, chatbots, coding games...)"
              aria-label="Search courses"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1,#7c3aed)] text-white transition hover:scale-105"
            >
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.35 }}
          className="relative mx-auto -mt-2 max-w-[960px]"
        >
          <Image
            src={HERO_ILLUSTRATION_SRC}
            alt="A young learner exploring AI alongside the Qasberry robot"
            width={960}
            height={369}
            priority
            className="h-auto w-full"
          />

          <button
            type="button"
            onClick={scrollToContent}
            className="group absolute bottom-[2%] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-2xl px-3 py-1.5 text-xs sm:text-sm text-slate-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 transition-colors"
          >
            <motion.span
              animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-white/90 text-indigo-600 shadow-sm group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-colors"
            >
              <ArrowDown size={16} />
            </motion.span>
            Your future with AI starts here
          </button>
        </motion.div>
      </div>

      {/* Blend the bottom of the banner into the white section below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.85)_65%,#ffffff_100%)]" aria-hidden />
    </section>
  )
}
