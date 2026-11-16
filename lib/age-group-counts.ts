// lib/age-group-counts.ts
// Published-course counts per age band, using the same filter as the catalog
// (app/(marketing)/courses/page.tsx) so each tile's number matches what its
// ?age= link shows. Server-only: kept apart from lib/age-groups.ts, which
// client components import.

import 'server-only'
import type { AgeGroup } from '@prisma/client'
import { db } from '@/lib/db'
import { visibleCareerWhere } from '@/lib/features'
import { ALL_AGE_GROUPS } from '@/lib/age-groups'

export async function getAgeGroupCounts(): Promise<Record<AgeGroup, number>> {
  const counts = await Promise.all(
    ALL_AGE_GROUPS.map((group) =>
      db.course.count({
        where: { status: 'PUBLISHED', ...visibleCareerWhere(), ageGroups: { has: group } },
      })
    )
  )
  return Object.fromEntries(ALL_AGE_GROUPS.map((g, i) => [g, counts[i]])) as Record<AgeGroup, number>
}
