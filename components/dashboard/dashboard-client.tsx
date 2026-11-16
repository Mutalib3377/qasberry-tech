'use client'
// components/dashboard/dashboard-client.tsx
// Student dashboard: stat cards plus In Progress / Completed / Certificates
// tabs. The active tab lives in ?tab= (pushState, so links and Back work with
// no server round-trip); enrollments arrive pre-sorted and pre-classified from
// app/dashboard/page.tsx.

import { useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  BookOpen, Award, ArrowRight, Zap, CheckCircle2, PlayCircle, RotateCcw,
  LayoutDashboard, GraduationCap, ExternalLink, Download,
} from 'lucide-react'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { SHOW_CAREER_ROADMAP } from '@/lib/features'
import { plural } from '@/lib/plural'

// Role labels
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  CONTENT_MANAGER: 'Content Manager',
  MODERATOR: 'Moderator',
  STUDENT: 'Student',
}

// Types
interface Enrollment {
  id: string
  courseId: string
  courseTitle: string
  courseThumbnail: string | null
  career: string
  lessonCount: number
  completedCount: number
  isComplete: boolean
  certificateId: string | null
  continueHref: string
  lastActivity: string
}

interface Certificate {
  id: string
  courseTitle: string
  issuedAt: string
  url: string | null
}

interface Props {
  firstName: string
  role: string
  enrollments: Enrollment[]
  certificates: Certificate[]
}

const TABS = [
  { key: 'in-progress', label: 'In Progress', icon: PlayCircle },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'certificates', label: 'Certificates', icon: Award },
] as const

type TabKey = (typeof TABS)[number]['key']

function isTabKey(value: string | null): value is TabKey {
  return TABS.some((t) => t.key === value)
}

// Enrollment card
function EnrollmentCard({ e, index }: { e: Enrollment; index: number }) {
  const pct = e.lessonCount > 0 ? Math.round((e.completedCount / e.lessonCount) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.25 }}>
      <Card variant="interactive" className="flex flex-col gap-4 h-full">
        {/* Thumbnail */}
        <div className="w-full h-36 rounded-xl bg-brand-purple-soft flex items-center justify-center overflow-hidden border border-brand-border/60">
          {e.courseThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.courseThumbnail} alt={e.courseTitle} className="w-full h-full object-cover" />
          ) : (
            <BookOpen size={32} className="text-brand-purple/40" />
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5 flex-1">
          <Badge variant="primary">{e.career}</Badge>
          <h3 className="text-brand-charcoal font-bold text-base leading-snug">{e.courseTitle}</h3>
          <p className="text-brand-tertiary text-xs">{e.completedCount} of {plural(e.lessonCount, 'lesson')} completed</p>
        </div>

        {/* Progress bar */}
        {e.lessonCount > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span className={e.isComplete ? 'text-brand-success' : 'text-brand-tertiary'}>
                {e.isComplete ? '✓ Complete' : `${pct}% done`}
              </span>
            </div>
            <ProgressBar value={e.isComplete ? 100 : pct} variant="thick" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          <Link
            href={e.continueHref}
            className="inline-flex items-center gap-1.5 text-brand-purple hover:text-brand-purple-hover text-sm font-semibold transition-colors"
          >
            {e.isComplete ? <RotateCcw size={14} aria-hidden /> : <PlayCircle size={14} aria-hidden />}
            {e.isComplete ? 'Review course' : 'Continue'}
            <ArrowRight size={14} />
          </Link>
          {e.certificateId && (
            <Link
              href={`/certificates/${e.certificateId}`}
              className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-semibold transition-colors"
            >
              <Award size={14} />
              Certificate
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// Certificate card
function CertCard({ c, index }: { c: Certificate; index: number }) {
  const issued = new Date(c.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.25 }}>
      <Card className="flex items-center gap-4 p-4 border-amber-200/60 bg-amber-50/50">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Award size={20} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-brand-charcoal text-sm font-semibold truncate">{c.courseTitle}</p>
          <p className="text-brand-tertiary text-xs">Issued {issued}</p>
        </div>
        <Link
          href={`/certificates/${c.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
        >
          <ExternalLink size={14} />
          View
        </Link>
        {c.url && (
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <Download size={14} />
            Download
          </a>
        )}
      </Card>
    </motion.div>
  )
}

// Main component
export function DashboardClient({ firstName, role, enrollments, certificates }: Props) {
  const searchParams = useSearchParams()
  const requested = searchParams.get('tab')
  const tab: TabKey = isTabKey(requested) ? requested : 'in-progress'
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ 'in-progress': null, completed: null, certificates: null })

  const inProgress = enrollments.filter((e) => !e.isComplete)
  const completed = enrollments.filter((e) => e.isComplete)
  const counts: Record<TabKey, number> = {
    'in-progress': inProgress.length,
    completed: completed.length,
    certificates: certificates.length,
  }

  const totalCompleted = enrollments.reduce((s, e) => s + e.completedCount, 0)
  const totalLessons = enrollments.reduce((s, e) => s + e.lessonCount, 0)

  function selectTab(key: TabKey, focus = false) {
    if (key !== tab) {
      const params = new URLSearchParams(searchParams.toString())
      if (key === 'in-progress') params.delete('tab')
      else params.set('tab', key)
      const qs = params.toString()
      // Next 14 syncs useSearchParams with native pushState — no refetch
      window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname)
    }
    if (focus) tabRefs.current[key]?.focus()
  }

  function onTabKeyDown(e: React.KeyboardEvent) {
    const i = TABS.findIndex((t) => t.key === tab)
    if (e.key === 'ArrowRight') selectTab(TABS[(i + 1) % TABS.length].key, true)
    else if (e.key === 'ArrowLeft') selectTab(TABS[(i - 1 + TABS.length) % TABS.length].key, true)
    else return
    e.preventDefault()
  }

  return (
    <AppShell
      headerRight={
        <Badge variant="primary" className="hidden sm:inline-flex px-3 py-1">
          {ROLE_LABELS[role] ?? role}
        </Badge>
      }
    >
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Page Header */}
        <PageHeader
          eyebrow="MY LEARNING"
          title={`Welcome back, ${firstName} 👋`}
          description="Track your active courses, progress and achievements in one place."
          action={
            SHOW_CAREER_ROADMAP ? (
              <Link id="dashboard-roadmap-btn" href="/onboarding">
                <Button variant="primary">
                  <Zap size={15} />
                  Build my roadmap
                </Button>
              </Link>
            ) : (
              <Link href="/courses">
                <Button variant="primary">
                  <Zap size={15} />
                  Browse courses
                </Button>
              </Link>
            )
          }
        />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Courses enrolled"
            value={enrollments.length}
            icon={<LayoutDashboard size={20} />}
            iconBg="bg-brand-purple-soft"
            iconColor="text-brand-purple"
          />
          <StatCard
            label="Certificates earned"
            value={certificates.length}
            icon={<Award size={20} />}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
          <StatCard
            label="Lessons completed"
            value={`${totalCompleted} / ${totalLessons}`}
            icon={<GraduationCap size={20} />}
            iconBg="bg-brand-accent-soft"
            iconColor="text-cyan-600"
          />
        </div>

        {/* My learning tabs — #certificates is the footer's deep-link target */}
        <section id="certificates" className="scroll-mt-28 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border">
            <div role="tablist" aria-label="My learning" className="flex gap-1 -mb-px" onKeyDown={onTabKeyDown}>
              {TABS.map(({ key, label, icon: Icon }) => {
                const selected = key === tab
                return (
                  <button
                    key={key}
                    ref={(el) => { tabRefs.current[key] = el }}
                    type="button"
                    role="tab"
                    id={`tab-${key}`}
                    aria-selected={selected}
                    aria-controls={`panel-${key}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectTab(key)}
                    className={`inline-flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-sm font-semibold transition-colors ${
                      selected
                        ? 'border-brand-purple text-brand-purple'
                        : 'border-transparent text-brand-tertiary hover:text-brand-charcoal hover:border-brand-border'
                    }`}
                  >
                    <Icon size={16} aria-hidden />
                    {label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${selected ? 'bg-brand-purple-soft text-brand-purple' : 'bg-brand-surface text-brand-tertiary'}`}
                    >
                      {counts[key]}
                    </span>
                  </button>
                )
              })}
            </div>
            <Link href="/courses" className="pb-3 text-sm font-semibold text-brand-purple hover:text-brand-purple-hover transition-colors">
              Explore catalog →
            </Link>
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'in-progress' && (
              inProgress.length === 0 ? (
                <EmptyState
                  icon={<BookOpen size={24} />}
                  heading={enrollments.length === 0 ? "You haven't enrolled in any courses yet." : 'Nothing in progress right now.'}
                  description={
                    enrollments.length === 0
                      ? 'Browse our fun, age-appropriate AI courses to get started.'
                      : 'You finished everything you started. Pick your next course!'
                  }
                  action={
                    <Link href="/courses">
                      <Button variant="primary" size="sm">
                        Browse Kids &amp; Teens courses <ArrowRight size={14} />
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgress.map((e, i) => <EnrollmentCard key={e.id} e={e} index={i} />)}
                </div>
              )
            )}

            {tab === 'completed' && (
              completed.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 size={24} />}
                  heading="No completed courses yet"
                  description="Finish your first course to see it here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completed.map((e, i) => <EnrollmentCard key={e.id} e={e} index={i} />)}
                </div>
              )
            )}

            {tab === 'certificates' && (
              certificates.length === 0 ? (
                <EmptyState
                  icon={<Award size={24} />}
                  heading="No certificates yet"
                  description="Complete any course on Qasberry to earn a verified certificate of completion."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.map((c, i) => <CertCard key={c.id} c={c} index={i} />)}
                </div>
              )
            )}
          </div>
        </section>

        {/* Roadmap CTA Card — hidden in the MVP (lib/features.ts) */}
        {SHOW_CAREER_ROADMAP && (
        <Card variant="featured" className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-xl font-bold text-brand-charcoal">Need a customized learning path?</h3>
            <p className="text-brand-secondary text-sm leading-relaxed">
              Tell our AI system your specific career role and goals. We will build a personalized AI roadmap mapped directly to relevant Qasberry courses.
            </p>
          </div>
          <Link href="/onboarding" id="dashboard-bottom-roadmap-btn" className="flex-shrink-0">
            <Button variant="primary">
              Get my roadmap <ArrowRight size={15} />
            </Button>
          </Link>
        </Card>
        )}
      </div>
    </AppShell>
  )
}
