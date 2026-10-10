'use client'
// components/shared/rich-text-editor.tsx
// Markdown editor with a formatting toolbar and a Write/Preview toggle.
//
// Content is stored as markdown, so existing plain-text descriptions and
// reading notes keep working unchanged. Pasting from Word / Google Docs / web
// pages converts the clipboard's HTML to markdown, so headings, bold, lists and
// links survive the paste instead of collapsing to plain text.

import { useRef, useState, type ClipboardEvent, type ReactNode } from 'react'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Quote, Minus } from 'lucide-react'
import { Markdown } from '@/components/shared/markdown'

let turndown: TurndownService | null = null
function htmlToMarkdown(html: string): string {
  if (!turndown) {
    turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' })
    turndown.use(gfm)
    // Word / Google Docs wrap pastes in <style>, <meta> and comment junk
    turndown.remove(['style', 'script', 'meta', 'title'])
  }
  return turndown.turndown(html).replace(/\n{3,}/g, '\n\n').trim()
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
}

export function RichTextEditor({ value, onChange, placeholder, rows = 8, maxLength }: RichTextEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [preview, setPreview] = useState(false)

  // Replace the current selection and restore a sensible selection afterwards.
  function apply(next: string, selStart: number, selEnd: number) {
    if (maxLength !== undefined && next.length > maxLength) return
    onChange(next)
    requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      el.focus()
      el.setSelectionRange(selStart, selEnd)
    })
  }

  function wrap(before: string, after: string, fallback: string) {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const selected = value.slice(s, e) || fallback
    const next = value.slice(0, s) + before + selected + after + value.slice(e)
    apply(next, s + before.length, s + before.length + selected.length)
  }

  // Prefix every line touched by the selection (headings, lists, quotes).
  function prefixLines(prefix: (i: number) => string) {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    const nl = value.indexOf('\n', e)
    const lineEnd = nl === -1 ? value.length : nl
    const lines = value.slice(lineStart, lineEnd).split('\n')
    const block = lines
      .map((l, i) => prefix(i) + l.replace(/^(#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/, ''))
      .join('\n')
    const next = value.slice(0, lineStart) + block + value.slice(lineEnd)
    apply(next, lineStart, lineStart + block.length)
  }

  function insertLink() {
    const el = ref.current
    if (!el) return
    const url = window.prompt('Link URL', 'https://')
    if (!url || url === 'https://') return
    const { selectionStart: s, selectionEnd: e } = el
    const text = value.slice(s, e) || 'link text'
    const md = `[${text}](${url})`
    apply(value.slice(0, s) + md + value.slice(e), s + 1, s + 1 + text.length)
  }

  function insertRule() {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const md = `${s > 0 && value[s - 1] !== '\n' ? '\n' : ''}\n---\n\n`
    apply(value.slice(0, s) + md + value.slice(s), s + md.length, s + md.length)
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const html = e.clipboardData.getData('text/html')
    if (!html) return // plain text paste — let the browser handle it
    const md = htmlToMarkdown(html)
    if (!md) return
    e.preventDefault()
    const el = e.currentTarget
    const { selectionStart: s, selectionEnd: end } = el
    let next = value.slice(0, s) + md + value.slice(end)
    if (maxLength !== undefined && next.length > maxLength) next = next.slice(0, maxLength)
    const caret = Math.min(s + md.length, next.length)
    onChange(next)
    requestAnimationFrame(() => ref.current?.setSelectionRange(caret, caret))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey)) return
    const k = e.key.toLowerCase()
    if (k === 'b') { e.preventDefault(); wrap('**', '**', 'bold text') }
    else if (k === 'i') { e.preventDefault(); wrap('*', '*', 'italic text') }
    else if (k === 'k') { e.preventDefault(); insertLink() }
  }

  const tools: { icon: ReactNode; label: string; run: () => void }[] = [
    { icon: <Bold size={14} />,        label: 'Bold (Ctrl/⌘+B)',   run: () => wrap('**', '**', 'bold text') },
    { icon: <Italic size={14} />,      label: 'Italic (Ctrl/⌘+I)', run: () => wrap('*', '*', 'italic text') },
    { icon: <Heading2 size={14} />,    label: 'Heading',           run: () => prefixLines(() => '## ') },
    { icon: <Heading3 size={14} />,    label: 'Subheading',        run: () => prefixLines(() => '### ') },
    { icon: <List size={14} />,        label: 'Bulleted list',     run: () => prefixLines(() => '- ') },
    { icon: <ListOrdered size={14} />, label: 'Numbered list',     run: () => prefixLines((i) => `${i + 1}. `) },
    { icon: <Quote size={14} />,       label: 'Quote',             run: () => prefixLines(() => '> ') },
    { icon: <Link2 size={14} />,       label: 'Link (Ctrl/⌘+K)',   run: insertLink },
    { icon: <Minus size={14} />,       label: 'Divider',           run: insertRule },
  ]

  const tabCls = (active: boolean) =>
    `px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 focus-within:border-violet-500 transition-colors">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-700 flex-wrap">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.label}
            aria-label={t.label}
            onClick={t.run}
            disabled={preview}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            {t.icon}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <button type="button" className={tabCls(!preview)} onClick={() => setPreview(false)}>Write</button>
          <button type="button" className={tabCls(preview)} onClick={() => setPreview(true)}>Preview</button>
        </div>
      </div>

      {preview ? (
        <div className="px-4 py-3 text-sm text-slate-300 leading-relaxed overflow-y-auto" style={{ minHeight: `${rows * 1.5 + 1.5}rem`, maxHeight: '32rem' }}>
          {value.trim() ? <Markdown tone="dark">{value}</Markdown> : <p className="text-slate-500">Nothing to preview yet.</p>}
        </div>
      ) : (
        <textarea
          ref={ref}
          className="w-full px-4 py-2.5 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none resize-y rounded-b-xl"
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
        />
      )}
    </div>
  )
}
