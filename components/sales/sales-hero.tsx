'use client'
// components/sales/sales-hero.tsx
// Hero for the Sales & Marketing landing page: headline, CTAs, and an
// "AI hub" diagram — a glowing AI orb wired to six skill nodes.

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ChartColumnBig,
  ChartLine,
  CircleCheck,
  Cog,
  Database,
  Megaphone,
  MessageCircleMore,
  Users,
} from 'lucide-react'
import { GLASS } from './sales-ui'

// Diagram coordinate space; the desktop diagram keeps this aspect ratio so
// the SVG curves and the absolutely-positioned nodes stay aligned.
const VB_W = 1400
const VB_H = 620
const ORB = { x: 700, y: 330 }

type Pt = [number, number]

const NODES = [
  {
    title: 'Lead Generation',
    body: 'Find the right prospects. Create better opportunities.',
    icon: Users,
    iconClass: 'text-indigo-600',
    side: 'left' as const,
    at: [70, 30] as Pt, // top-left of the node block
    curve: [[405, 112], [455, 200], [560, 310], [640, 326]] as Pt[],
  },
  {
    title: 'Sales Automation',
    body: 'Spend less time on repetitive tasks. More time closing deals.',
    icon: Cog,
    iconClass: 'text-blue-600',
    side: 'left' as const,
    at: [50, 290] as Pt,
    curve: [[420, 330], [500, 330], [560, 330], [618, 330]] as Pt[],
  },
  {
    title: 'Campaign Automation',
    body: 'Create smarter campaigns with less manual work.',
    icon: Megaphone,
    iconClass: 'text-violet-600',
    side: 'left' as const,
    at: [70, 530] as Pt,
    curve: [[410, 560], [520, 545], [560, 360], [640, 334]] as Pt[],
  },
  {
    title: 'Customer Engagement',
    body: 'Build stronger relationships with every interaction.',
    icon: MessageCircleMore,
    iconClass: 'text-emerald-500',
    side: 'right' as const,
    at: [1010, 30] as Pt,
    curve: [[995, 112], [945, 200], [840, 310], [760, 326]] as Pt[],
  },
  {
    title: 'Marketing Analytics',
    body: 'Turn data into better decisions.',
    icon: ChartColumnBig,
    iconClass: 'text-blue-600',
    side: 'right' as const,
    at: [1030, 290] as Pt,
    curve: [[1010, 330], [900, 330], [840, 330], [782, 330]] as Pt[],
  },
  {
    title: 'CRM & Data Integration',
    body: 'Connect your data. Improve your insights.',
    icon: Database,
    iconClass: 'text-amber-500',
    side: 'right' as const,
    at: [1010, 530] as Pt,
    curve: [[990, 560], [880, 545], [840, 360], [760, 334]] as Pt[],
  },
]

const CHECKS = ['Practical AI skills.', 'Real-world applications.', 'Measurable progress.']

function curvePath([p0, c1, c2, p3]: Pt[]) {
  return `M${p0[0]} ${p0[1]} C${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p3[0]} ${p3[1]}`
}

/** Point on a cubic Bézier at t — used to place the small ring markers. */
function pointAt([p0, c1, c2, p3]: Pt[], t: number): Pt {
  const u = 1 - t
  const f = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * c1[i] + 3 * u * t * t * c2[i] + t * t * t * p3[i]
  return [f(0), f(1)]
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`

function AiOrb({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const reduceMotion = useReducedMotion()
  const outer = size === 'lg' ? 'h-44 w-44' : 'h-32 w-32'
  const inner = size === 'lg' ? 'h-24 w-24 text-[2rem]' : 'h-[4.5rem] w-[4.5rem] text-2xl'

  return (
    <div className={`relative ${outer}`}>
      <motion.div
        aria-hidden
        animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.45)_0%,rgba(139,92,246,0.28)_35%,rgba(59,130,246,0.12)_55%,transparent_70%)] blur-md"
      />
      <div className="absolute inset-0 rounded-full border border-white/80 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.95),rgba(224,231,255,0.7)_45%,rgba(196,181,253,0.55)_100%)] backdrop-blur-xl shadow-[0_0_60px_-6px_rgba(99,102,241,0.65),inset_0_2px_10px_rgba(255,255,255,0.9)]" />
      <motion.div
        aria-hidden
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-3 rounded-full border border-dashed border-indigo-300/70"
      />
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full font-bold tracking-tight text-white ${inner} bg-[radial-gradient(circle_at_35%_30%,#3b3f8f,#161a45_60%,#0d1030)] shadow-[0_8px_24px_-6px_rgba(15,21,53,0.7),inset_0_0_0_2px_rgba(129,140,248,0.35)]`}
      >
        AI
      </div>
    </div>
  )
}

function NodeIcon({ icon: Icon, className }: { icon: typeof Users; className: string }) {
  return (
    <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-white bg-white/85 backdrop-blur-md shadow-[0_18px_40px_-18px_rgba(79,70,229,0.45),0_0_0_6px_rgba(255,255,255,0.45)]">
      <Icon size={30} className={className} strokeWidth={2.2} />
    </span>
  )
}

function HubDiagram() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative mx-auto hidden w-full max-w-[1400px] lg:block lg:mt-10 2xl:-mt-28" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
      {/* Dotted grid fading out around the orb */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(rgba(99,102,241,0.22) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          maskImage: 'radial-gradient(ellipse 28% 42% at 50% 54%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 28% 42% at 50% 54%, black 20%, transparent 75%)',
        }}
      />

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
        <defs>
          <linearGradient id="hub-line-l" gradientUnits="userSpaceOnUse" x1="400" y1="0" x2="640" y2="0">
            <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="hub-line-r" gradientUnits="userSpaceOnUse" x1="1000" y1="0" x2="760" y2="0">
            <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {NODES.map((node, i) => {
          const d = curvePath(node.curve)
          const [mx, my] = pointAt(node.curve, node.curve[0][1] === node.curve[3][1] ? 0.05 : 0.33)
          return (
            <g key={node.title}>
              <motion.path
                d={d}
                stroke={`url(#hub-line-${node.side === 'left' ? 'l' : 'r'})`}
                strokeWidth={1.6}
                initial={{ pathLength: reduceMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
              />
              <circle cx={mx} cy={my} r={6} fill="#fff" stroke="#6366f1" strokeWidth={2} />
              {!reduceMotion && (
                <circle r={3.5} fill="#7c3aed">
                  <animateMotion dur={`${2.8 + (i % 3) * 0.5}s`} begin={`${1.4 + i * 0.35}s`} repeatCount="indefinite" path={d} />
                  <animate attributeName="opacity" values="0;1;1;0" dur={`${2.8 + (i % 3) * 0.5}s`} begin={`${1.4 + i * 0.35}s`} repeatCount="indefinite" />
                </circle>
              )}
            </g>
          )
        })}
      </svg>

      {/* Orb */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: pct(ORB.x, VB_W), top: pct(ORB.y, VB_H) }}
      >
        <AiOrb />
      </div>

      {/* Skill nodes */}
      {NODES.map((node, i) => {
        const Icon = node.icon
        return (
          <motion.div
            key={node.title}
            initial={{ opacity: 0, x: node.side === 'left' ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, delay: 0.4 + i * 0.08 }}
            className="absolute flex w-[25%] items-start gap-5"
            style={{ left: pct(node.at[0], VB_W), top: pct(node.at[1], VB_H) }}
          >
            <NodeIcon icon={Icon} className={node.iconClass} />
            <div className="pt-2">
              <h3 className="text-[17px] font-bold text-[#0f1535]">{node.title}</h3>
              <p className="mt-1.5 max-w-[220px] text-sm leading-relaxed text-slate-500">{node.body}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/** Stacked layout for phones and tablets, where the wired diagram won't fit. */
function HubCompact() {
  return (
    <div className="mt-14 lg:hidden">
      <div className="flex justify-center">
        <AiOrb size="sm" />
      </div>
      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {NODES.map((node) => {
          const Icon = node.icon
          return (
            <div key={node.title} className={`flex items-start gap-4 rounded-3xl p-4 ${GLASS}`}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon size={22} className={node.iconClass} />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-[#0f1535]">{node.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{node.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SalesHero() {
  const reduceMotion = useReducedMotion()
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.55, delay },
  })

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 pb-16 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f9faff_0%,#f3f5fe_60%,rgba(243,245,254,0)_100%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <motion.div
          {...fadeUp(0)}
          className="inline-flex items-center gap-2.5 rounded-full border border-indigo-100 bg-indigo-50/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600"
        >
          <ChartLine size={15} />
          AI for Sales &amp; Marketing
        </motion.div>

        <motion.h1
          {...fadeUp(0.06)}
          className="mt-6 text-[2.6rem] leading-[1.06] sm:text-6xl lg:text-[4.6rem] font-extrabold tracking-[-0.035em] text-[#0f1535]"
        >
          Turn AI Into Your
          <br />
          <span className="bg-[linear-gradient(100deg,#3b82f6_0%,#5b5cf6_55%,#7c3aed_100%)] bg-clip-text text-transparent">
            Competitive Advantage.
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.12)} className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
          Learn how to leverage AI to generate leads, automate campaigns, engage customers, and make smarter marketing
          decisions. Build practical skills you can apply to your work, business, and career.
        </motion.p>

        <motion.div {...fadeUp(0.18)} className="relative z-20 mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="#courses"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(120deg,#5b5cf6,#4f46e5)] px-8 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(79,70,229,0.7)] hover:shadow-[0_18px_36px_-12px_rgba(79,70,229,0.8)] transition-all"
          >
            Explore Courses
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#paths"
            className="inline-flex h-12 items-center rounded-full border border-slate-200 bg-white/70 backdrop-blur-md px-8 text-sm font-semibold text-[#0f1535] hover:border-indigo-200 hover:bg-white transition-all"
          >
            Find Your Learning Path
          </Link>
        </motion.div>

        <motion.ul {...fadeUp(0.24)} className="relative z-20 mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {CHECKS.map((check) => (
            <li key={check} className="flex items-center gap-2 text-sm text-slate-500">
              <CircleCheck size={17} className="fill-indigo-400 text-white" />
              {check}
            </li>
          ))}
        </motion.ul>
      </div>

      <div className="relative px-4 sm:px-6">
        <HubDiagram />
        <HubCompact />
      </div>
    </section>
  )
}
