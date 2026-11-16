// lib/features.ts
// MVP feature switches. The current MVP serves the Youth track only.
// Hidden tracks and features keep all their code, routes and DB data —
// flip the values below to bring them back.

// Audience tracks shown on the public site (see components/marketing/audiences.ts).
// Full set: ['kids', 'sales'] — 'kids' is the internal key of the Youth track.
export const ENABLED_TRACKS: readonly string[] = ['kids']

// DB slugs of the Kids & Teens career. It was seeded as 'kid' (name "Kids").
// Renaming it in Admin → Settings regenerates the slug from the new name —
// "Youth" → 'youth', "Kids & Teens" → 'kids-and-teens' — so accept all of them,
// or a rename would hide every course from the public site.
export const YOUTH_CAREER_SLUGS: readonly string[] = ['kid', 'youth', 'kids-and-teens']

// Career slugs whose courses and communities are visible to the public.
// Leave empty to show every career (pre-MVP behaviour).
export const MVP_CAREER_SLUGS: readonly string[] = [...YOUTH_CAREER_SLUGS]

// Community hubs (/community, nav links, admin moderation). Hidden for now —
// set to true to bring the whole feature back.
export const SHOW_COMMUNITY = false

// Professional AI roadmap bot (/onboarding + dashboard panel).
export const SHOW_CAREER_ROADMAP = false

export function isCareerVisible(slug: string | null | undefined) {
  if (MVP_CAREER_SLUGS.length === 0) return true
  return !!slug && MVP_CAREER_SLUGS.includes(slug)
}

// Prisma `where` fragment that limits courses/communities to visible careers
export function visibleCareerWhere() {
  return MVP_CAREER_SLUGS.length === 0
    ? {}
    : { career: { slug: { in: [...MVP_CAREER_SLUGS] } } }
}
