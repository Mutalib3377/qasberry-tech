// lib/plural.ts
// Count + noun formatting so the UI never reads "1 modules" or "1 lessons".

/**
 * Formats a count with the singular or plural form of a noun.
 * Example: plural(1, 'module') → "1 module", plural(11, 'lesson') → "11 lessons"
 */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : pluralForm}`
}

type ContentItem = { type?: 'VIDEO' | 'READING' | 'QUIZ' | null }

/**
 * Describes a set of course items by type, so videos read as "lessons",
 * readings as "readings" and quizzes as "quizzes" — zero counts are omitted.
 * Items with no type are treated as VIDEO (the schema default).
 *
 * contentSummary(items)                    → "5 lessons · 3 readings · 1 quiz"
 * contentSummary(items, { natural: true }) → "5 lessons, 3 readings and 1 quiz"
 */
export function contentSummary(items: ContentItem[], opts: { natural?: boolean } = {}): string {
  let videos = 0, readings = 0, quizzes = 0
  for (const i of items) {
    if (i.type === 'READING') readings++
    else if (i.type === 'QUIZ') quizzes++
    else videos++
  }
  const parts = [
    videos   > 0 && plural(videos, 'lesson'),
    readings > 0 && plural(readings, 'reading'),
    quizzes  > 0 && plural(quizzes, 'quiz', 'quizzes'),
  ].filter(Boolean) as string[]

  if (parts.length === 0) return plural(0, 'lesson')
  if (!opts.natural) return parts.join(' · ')
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}
