// components/shared/markdown.tsx
// Renders admin-authored markdown (course descriptions, reading lessons).
//
// Raw HTML in the source is NOT rendered (react-markdown's default), and
// javascript:/data: links are stripped by its default urlTransform, so this is
// safe for content typed or pasted by instructors. remark-breaks keeps single
// line breaks, so older plain-text content written before formatting existed
// still renders the way it was typed.

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

type Tone = 'light' | 'dark'

const TONE: Record<Tone, { heading: string; link: string; code: string; quote: string; rule: string; table: string }> = {
  light: {
    heading: 'text-slate-900',
    link:    'text-violet-700 hover:text-violet-800',
    code:    'bg-slate-100 text-slate-800',
    quote:   'border-slate-300 text-slate-600',
    rule:    'border-slate-200',
    table:   'border-slate-200',
  },
  dark: {
    heading: 'text-white',
    link:    'text-violet-400 hover:text-violet-300',
    code:    'bg-slate-800 text-slate-200',
    quote:   'border-slate-600 text-slate-400',
    rule:    'border-slate-700',
    table:   'border-slate-700',
  },
}

function components(tone: Tone): Components {
  const t = TONE[tone]
  return {
    h1: ({ children }) => <h2 className={`text-xl font-bold mt-5 mb-2 first:mt-0 ${t.heading}`}>{children}</h2>,
    h2: ({ children }) => <h3 className={`text-lg font-bold mt-4 mb-2 first:mt-0 ${t.heading}`}>{children}</h3>,
    h3: ({ children }) => <h4 className={`text-base font-semibold mt-4 mb-1.5 first:mt-0 ${t.heading}`}>{children}</h4>,
    h4: ({ children }) => <h5 className={`font-semibold mt-3 mb-1 first:mt-0 ${t.heading}`}>{children}</h5>,
    p:  ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-3 last:mb-0 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 last:mb-0 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="pl-1">{children}</li>,
    strong: ({ children }) => <strong className={`font-semibold ${t.heading}`}>{children}</strong>,
    a:  ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-2 ${t.link}`}>
        {children}
      </a>
    ),
    blockquote: ({ children }) => <blockquote className={`border-l-4 pl-4 italic my-3 ${t.quote}`}>{children}</blockquote>,
    hr: () => <hr className={`my-5 ${t.rule}`} />,
    code: ({ children }) => <code className={`px-1.5 py-0.5 rounded text-[0.9em] font-mono ${t.code}`}>{children}</code>,
    pre: ({ children }) => <pre className={`p-3 rounded-lg overflow-x-auto mb-3 text-sm [&_code]:p-0 ${t.code}`}>{children}</pre>,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-3">
        <table className={`w-full text-sm border-collapse border ${t.table}`}>{children}</table>
      </div>
    ),
    th: ({ children }) => <th className={`border px-3 py-1.5 text-left font-semibold ${t.table}`}>{children}</th>,
    td: ({ children }) => <td className={`border px-3 py-1.5 ${t.table}`}>{children}</td>,
  }
}

export function Markdown({ children, tone = 'light', className = '' }: { children: string; tone?: Tone; className?: string }) {
  return (
    <div className={`break-words ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components(tone)}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

/** Plain-text version for places that can't show formatting (cards, <meta>, previews). */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/gm, '')
    .replace(/(\*\*|__|\*|_|~~|`)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
