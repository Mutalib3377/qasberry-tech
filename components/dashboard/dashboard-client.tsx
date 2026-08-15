'use client'
// components/dashboard/dashboard-client.tsx
// Rich student dashboard UI — unified light design system.

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen, Award, ArrowRight, Zap,
  LayoutDashboard, GraduationCap, ExternalLink,
} from 'lucide-react'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { ProgressBar } from '@/components/shared/ProgressBar'

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
  enrolledAt: string
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

// Enrollment card 
function EnrollmentCard({ e, index }: { e: Enrollment; index: number }) {
  const pct = e.lessonCount > 0
    ? Math.round((e.completedCount / e.lessonCount) * 100)
    : 0
  const isComplete = pct === 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
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
          <Badge variant="primary">
            {e.career}
          </Badge>
          <h3 className="text-brand-charcoal font-bold text-base leading-snug">{e.courseTitle}</h3>
          <p className="text-brand-tertiary text-xs">{e.completedCount} of {e.lessonCount} lessons completed</p>
        </div>

        {/* Progress bar */}
        {e.lessonCount > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span className={isComplete ? 'text-brand-success' : 'text-brand-tertiary'}>
                {isComplete ? '✓ Complete' : `${pct}% done`}
              </span>
            </div>
            <ProgressBar value={pct} variant="thick" />
          </div>
        )}

        <Link
          href={`/learn/${e.courseId}`}
          className="inline-flex items-center gap-1.5 text-brand-purple hover:text-brand-purple-hover text-sm font-semibold pt-1 transition-all"
        >
          {isComplete ? 'Review course' : 'Continue learning'}
          <ArrowRight size={14} />
        </Link>
      </Card>
    </motion.div>
  )
}

// Certificate card 
function CertCard({ c, index }: { c: Certificate; index: number }) {
  const issued = new Date(c.issuedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="flex items-center gap-4 p-4 border-amber-200/60 bg-amber-50/50">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Award size={20} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-brand-charcoal text-sm font-semibold truncate">{c.courseTitle}</p>
          <p className="text-brand-tertiary text-xs">Issued {issued}</p>
        </div>
        {c.url && (
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-tertiary hover:text-amber-600 transition-colors p-1"
            aria-label="View certificate"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </Card>
    </motion.div>
  )
}

// Main component 
export function DashboardClient({ firstName, role, enrollments, certificates }: Props) {
  const totalCompleted = enrollments.reduce((s, e) => s + e.completedCount, 0)
  const totalLessons = enrollments.reduce((s, e) => s + e.lessonCount, 0)

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
          description="Track your active courses, roadmap progress, and career achievements in one place."
          action={
            <Link id="dashboard-roadmap-btn" href="/onboarding">
              <Button variant="primary">
                <Zap size={15} />
                Build my roadmap
              </Button>
            </Link>
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

        {/* My Courses */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-charcoal">My Courses</h2>
            <Link href="/courses" className="text-sm font-semibold text-brand-purple hover:text-brand-purple-hover transition-colors">
              Explore catalog →
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} />}
              heading="You haven't enrolled in any courses yet."
              description="Browse our career-first AI learning tracks to get started on your roadmap."
              action={
                <Link href="/courses">
                  <Button variant="primary" size="sm">
                    Browse career tracks <ArrowRight size={14} />
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((e, i) => (
                <EnrollmentCard key={e.id} e={e} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Certificates */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-brand-charcoal">My Certificates</h2>
          {certificates.length === 0 ? (
            <EmptyState
              icon={<Award size={24} />}
              heading="No certificates yet"
              description="Complete any course on Qasberry to earn a verified certificate of completion."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((c, i) => (
                <CertCard key={c.id} c={c} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Roadmap CTA Card */}
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
      </div>
    </AppShell>
  )
}
