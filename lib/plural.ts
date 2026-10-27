// lib/plural.ts
// Count + noun formatting so the UI never reads "1 modules" or "1 lessons".

/**
 * Formats a count with the singular or plural form of a noun.
 * Example: plural(1, 'module') → "1 module", plural(11, 'lesson') → "11 lessons"
 */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : pluralForm}`
}
