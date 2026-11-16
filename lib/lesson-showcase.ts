// lib/lesson-showcase.ts
// Real data for the homepage "Peek inside a lesson" section: one published
// Kids & Teens course's lesson list, a reading excerpt and its first quiz
// question. Server-only. Never selects Option.isCorrect — the preview shows
// a question, not its answer.

import 'server-only'
import { db } from '@/lib/db'
import { visibleCareerWhere } from '@/lib/features'
import { stripMarkdown } from '@/components/shared/markdown'

export type ShowcaseLesson = {
  kind: 'VIDEO' | 'READING' | 'QUIZ'
  title: string
  meta: string
}

export type LessonShowcase = {
  course: { title: string; slug: string; thumbnail: string | null }
  lessons: ShowcaseLesson[]
  video: { title: string; seconds: number } | null
  reading: { title: string; excerpt: string; minutes: number } | null
  quiz: { total: number; prompt: string; options: string[] } | null
  hasFreePreview: boolean
}

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'is', 'of', 'on', 'or', 'the', 'to'])

// "WHAT IS ARTIFICIAL INTELLIGENCE?" → "What is Artificial Intelligence?" (keeps "AI")
function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (word.replace(/[^a-z]/g, '') === 'ai') return word.toUpperCase()
      if (i > 0 && SMALL_WORDS.has(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

// Reading lessons start with "# LESSON 3: HOW AI LEARNS" — the real topic title
function topicFromReading(content: string | null): { number: number; title: string } | null {
  const match = content?.match(/^#\s*LESSON\s*(\d+)\s*[:\-–]\s*(.+)$/im)
  return match ? { number: Number(match[1]), title: titleCase(match[2].trim()) } : null
}

function excerptFrom(content: string): string {
  const afterIntro = content.split(/^##\s*Introduction\s*$/im)[1] ?? content
  const paragraph = afterIntro.split(/\n\s*\n/).map((p) => stripMarkdown(p).trim()).find((p) => p.length > 60) ?? ''
  if (paragraph.length <= 280) return paragraph
  const cut = paragraph.slice(0, 280)
  const sentenceEnd = cut.lastIndexOf('. ')
  return sentenceEnd > 120 ? cut.slice(0, sentenceEnd + 1) : `${cut.trimEnd()}…`
}

function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export async function getLessonShowcase(): Promise<LessonShowcase | null> {
  const courses = await db.course.findMany({
    where: { status: 'PUBLISHED', ...visibleCareerWhere() },
    orderBy: { createdAt: 'asc' },
    select: {
      title: true,
      slug: true,
      thumbnail: true,
      modules: {
        orderBy: { order: 'asc' },
        select: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { title: true, type: true, duration: true, content: true, isFree: true, quizId: true },
          },
        },
      },
    },
  })
  if (courses.length === 0) return null

  // Prefer a course with a free preview, then one with written readings
  const lessonsOf = (c: (typeof courses)[number]) => c.modules.flatMap((m) => m.lessons)
  const course =
    courses.find((c) => lessonsOf(c).some((l) => l.isFree)) ??
    courses.find((c) => lessonsOf(c).some((l) => l.type === 'READING' && topicFromReading(l.content))) ??
    courses[0]
  const all = lessonsOf(course)

  const topics = new Map<number, string>()
  for (const l of all) {
    const topic = topicFromReading(l.content)
    if (topic) topics.set(topic.number, topic.title)
  }
  const numberIn = (title: string) => Number(title.match(/\d+/)?.[0] ?? NaN)

  let videoCount = 0
  let readingCount = 0
  const lessons: ShowcaseLesson[] = all.slice(0, 7).map((l) => {
    if (l.type === 'VIDEO') {
      videoCount++
      const topic = topics.get(numberIn(l.title)) ?? topics.get(videoCount)
      return { kind: 'VIDEO', title: topic ? `Watch: ${topic}` : l.title, meta: l.duration ? clock(l.duration) : 'Video' }
    }
    if (l.type === 'READING') {
      readingCount++
      const topic = topicFromReading(l.content)?.title ?? topics.get(readingCount)
      return { kind: 'READING', title: topic ? `Read: ${topic}` : l.title, meta: 'Reading' }
    }
    return { kind: 'QUIZ', title: l.title, meta: 'Quiz' }
  })

  const firstVideo = all.find((l) => l.type === 'VIDEO')
  const firstReading = all.find((l) => l.type === 'READING' && l.content)
  const quizLesson = all.find((l) => l.type === 'QUIZ' && l.quizId)

  const quiz = quizLesson?.quizId
    ? await db.quiz.findUnique({
        where: { id: quizLesson.quizId },
        select: {
          _count: { select: { questions: true } },
          questions: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { prompt: true, options: { orderBy: { order: 'asc' }, select: { text: true } } },
          },
        },
      })
    : null
  const question = quiz?.questions[0]
  if (quiz && quizLesson) {
    const row = lessons.find((l) => l.kind === 'QUIZ')
    if (row) row.meta = `${quiz._count.questions} questions`
  }

  return {
    course: { title: course.title, slug: course.slug, thumbnail: course.thumbnail },
    lessons,
    video: firstVideo
      ? { title: topics.get(numberIn(firstVideo.title)) ?? topics.get(1) ?? firstVideo.title, seconds: firstVideo.duration ?? 0 }
      : null,
    reading: firstReading?.content
      ? {
          title: topicFromReading(firstReading.content)?.title ?? firstReading.title,
          excerpt: excerptFrom(firstReading.content),
          minutes: Math.max(1, Math.round(stripMarkdown(firstReading.content).split(/\s+/).length / 200)),
        }
      : null,
    quiz: question && quiz ? { total: quiz._count.questions, prompt: question.prompt, options: question.options.map((o) => o.text) } : null,
    hasFreePreview: all.some((l) => l.isFree),
  }
}
