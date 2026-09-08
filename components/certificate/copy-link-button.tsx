'use client'
// components/certificate/copy-link-button.tsx
// Extracted from app/certificates/[id]/page.tsx — a Server Component can't
// pass an inline onClick to a DOM element (React Server Components reject
// this unconditionally, in dev and production alike); this was a pre-existing
// bug making every certificate page 500, discovered while verifying P6.
// This is the smallest possible fix: only the one interactive control moves
// into a Client Component, the certificate page itself stays a Server
// Component exactly as before.

export function CopyLinkButton() {
  function copyLink() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <button
      id="copy-cert-link-btn"
      onClick={copyLink}
      className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-colors"
    >
      Copy link
    </button>
  )
}
