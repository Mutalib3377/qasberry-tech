// lib/age-groups.ts
// Age bands a course can be tagged with (Course.ageGroups). One place for the
// labels, the ?age= URL values used by the catalog filter, and the combined
// range label shown on cards ("Ages 10–16").

import type { AgeGroup } from '@prisma/client'

export const AGE_GROUPS: readonly {
  value: AgeGroup
  /** ?age= value in the catalog URL */
  param: string
  label: string
  min: number
  max: number
}[] = [
  { value: 'AGES_6_9', param: '6-9', label: 'Ages 6–9', min: 6, max: 9 },
  { value: 'AGES_10_12', param: '10-12', label: 'Ages 10–12', min: 10, max: 12 },
  { value: 'AGES_13_16', param: '13-16', label: 'Ages 13–16', min: 13, max: 16 },
]

export const ALL_AGE_GROUPS: AgeGroup[] = AGE_GROUPS.map((g) => g.value)

export function ageGroupFromParam(param: string | undefined | null): AgeGroup | null {
  return AGE_GROUPS.find((g) => g.param === param)?.value ?? null
}

export function isAgeGroup(value: unknown): value is AgeGroup {
  return AGE_GROUPS.some((g) => g.value === value)
}

/**
 * Human label for a course's bands. Adjacent bands merge into one range:
 * all three → "Ages 6–16", 10–12 + 13–16 → "Ages 10–16",
 * 6–9 + 13–16 → "Ages 6–9 & 13–16".
 */
export function ageRangeLabel(groups: readonly AgeGroup[]): string {
  const bands = AGE_GROUPS.filter((g) => groups.includes(g.value))
  if (bands.length === 0) return ''

  const ranges: { min: number; max: number }[] = []
  for (const band of bands) {
    const last = ranges[ranges.length - 1]
    if (last && band.min === last.max + 1) last.max = band.max
    else ranges.push({ min: band.min, max: band.max })
  }
  return `Ages ${ranges.map((r) => `${r.min}–${r.max}`).join(' & ')}`
}
