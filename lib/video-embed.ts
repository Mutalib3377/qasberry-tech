// lib/video-embed.ts
// Converts raw share URLs from YouTube, Google Drive, Vimeo, and Loom
// into embeddable iframe src URLs.
//
// Run server-side only (see app/api/learn/[courseId]/route.ts) so the raw
// share link a student's browser never sees the original pasted link —
// only the derived, embed-only URL is sent to the client.

export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)

    // YouTube: https://www.youtube.com/watch?v=ID or https://youtu.be/ID
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.hostname.includes('youtu.be')
        ? u.pathname.slice(1)
        : u.searchParams.get('v')
      if (!id) return null
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
    }

    // Google Drive: https://drive.google.com/file/d/FILE_ID/view
    if (u.hostname.includes('drive.google.com')) {
      const match = u.pathname.match(/\/file\/d\/([^/]+)/)
      if (!match) return null
      return `https://drive.google.com/file/d/${match[1]}/preview`
    }

    // Vimeo: https://vimeo.com/ID
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (!id) return null
      return `https://player.vimeo.com/video/${id}?title=0&byline=0`
    }

    // Loom: https://www.loom.com/share/ID
    if (u.hostname.includes('loom.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (!id) return null
      return `https://www.loom.com/embed/${id}`
    }

    return null
  } catch {
    return null
  }
}
