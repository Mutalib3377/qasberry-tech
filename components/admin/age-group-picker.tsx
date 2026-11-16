// components/admin/age-group-picker.tsx
// Multi-select chips for a course's age bands (Course.ageGroups). At least one
// band stays selected — the API rejects an empty list.
'use client'

import type { AgeGroup } from '@prisma/client'
import { Check } from 'lucide-react'
import { AGE_GROUPS } from '@/lib/age-groups'

export function AgeGroupPicker({
  value,
  onChange,
  labelClassName = 'block text-sm font-medium text-slate-300 mb-1.5',
}: {
  value: AgeGroup[]
  onChange: (next: AgeGroup[]) => void
  labelClassName?: string
}) {
  function toggle(group: AgeGroup) {
    const selected = value.includes(group)
    if (selected && value.length === 1) return
    const next = selected ? value.filter((g) => g !== group) : [...value, group]
    // Keep youngest → oldest order regardless of click order
    onChange(AGE_GROUPS.map((g) => g.value).filter((g) => next.includes(g)))
  }

  return (
    <fieldset>
      <legend className={labelClassName}>Age groups</legend>
      <div className="flex flex-wrap gap-2">
        {AGE_GROUPS.map((g) => {
          const selected = value.includes(g.value)
          const locked = selected && value.length === 1
          return (
            <button
              key={g.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(g.value)}
              title={locked ? 'A course needs at least one age group' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'border-violet-500/60 bg-violet-600/20 text-violet-200'
                  : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              } ${locked ? 'cursor-not-allowed' : ''}`}
            >
              {selected && <Check size={14} />}
              {g.label}
            </button>
          )
        })}
      </div>
      <p className="mt-1.5 text-xs text-slate-500">Learners filtering the catalog by age see this course under every band you pick.</p>
    </fieldset>
  )
}
