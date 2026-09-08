// lib/supabase-storage.ts
// Supabase Storage helpers for Qasberry lesson documents (PDFs/notes).
// Mirrors the shape of lib/mux.ts — small, focused helpers, no business logic.
//
// This is a Storage-only client. Every existing Postgres table (users, courses,
// lessons, ...) is still queried exclusively through Prisma — nothing here
// changes that. Supabase's own Postgres client/RLS is not used anywhere; this
// module only ever talks to the Storage API.
//
// Env vars required:
//   SUPABASE_URL              — Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY — service-role key (server-side only, NEVER exposed to the client)

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'lesson-documents'
const DEFAULT_SIGNED_URL_TTL_SECONDS = 600 // 10 minutes, per the audit

// Security: service-role client is only ever instantiated server-side — never
// exposed to the client. It bypasses RLS entirely, which is fine here because
// this bucket intentionally has no RLS policy at all (see ensureBucketExists) —
// access is enforced purely in application code (the enrollment check that
// runs before createSignedDocumentUrl is ever called), not in Postgres/Storage
// policy language.
//
// Built lazily (on first real use, not at module import time): createClient()
// validates SUPABASE_URL synchronously and throws if it isn't a well-formed
// URL. Constructing it eagerly at module scope means *every* route that
// merely imports this file — even ones that never call a Storage function —
// fails to load if the env var is missing/malformed, which is exactly what
// broke `next build`'s page-data-collection step in this environment (see P3
// report: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are still the literal
// placeholder "REPLACE_ME" in .env.local, not real credentials). Building
// lazily means the app still builds and every unrelated route still works;
// only an actual attempt to use Storage fails, with a clear error, at the
// point of use.
let cached: SupabaseClient | null = null
function getClient(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  }
  return cached
}

let bucketEnsured = false

/**
 * Creates the `lesson-documents` bucket if it doesn't already exist, as a
 * private bucket with no public read access. Idempotent and cheap to call on
 * every cold start — Supabase returns a normal (non-throwing) "already
 * exists" style response for a duplicate create, but we still cache the
 * result per server instance to avoid a redundant API call on every upload.
 */
async function ensureBucketExists(): Promise<void> {
  if (bucketEnsured) return

  const { data: existing } = await getClient().storage.getBucket(BUCKET)
  if (!existing) {
    const { error } = await getClient().storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: '20MB',
      allowedMimeTypes: ['application/pdf'],
    })
    // Ignore a race where another instance created it a moment earlier.
    if (error && !/already exists/i.test(error.message)) {
      throw error
    }
  }

  bucketEnsured = true
}

/**
 * Uploads a lesson document (PDF) to private Storage.
 * Returns the object key (e.g. `lessons/<lessonId>/<filename>`) — store this
 * on lesson.documentKey. The bucket is private; this key alone grants no
 * access without a signed URL minted via createSignedDocumentUrl().
 */
export async function uploadLessonDocument(
  lessonId: string,
  file: Buffer,
  filename: string
): Promise<string> {
  await ensureBucketExists()

  const key = `lessons/${lessonId}/${filename}`

  const { error } = await getClient().storage.from(BUCKET).upload(key, file, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) throw error

  return key
}

/**
 * Mints a short-lived signed URL for a lesson document.
 * Callers are responsible for verifying the requester is actually
 * enrolled/entitled to view this lesson *before* calling this — see
 * app/api/learn/[courseId]/[lessonId]/document-url/route.ts, which does that
 * check first.
 */
export async function createSignedDocumentUrl(
  key: string,
  ttlSeconds: number = DEFAULT_SIGNED_URL_TTL_SECONDS
): Promise<string> {
  const { data, error } = await getClient().storage.from(BUCKET).createSignedUrl(key, ttlSeconds)
  if (error) throw error
  return data.signedUrl
}

/**
 * Deletes a lesson document from Storage by key.
 * Called when a document is replaced (before/after writing the new key) —
 * mirrors deleteMuxAsset() in lib/mux.ts.
 */
export async function deleteLessonDocument(key: string): Promise<void> {
  const { error } = await getClient().storage.from(BUCKET).remove([key])
  if (error) throw error
}
