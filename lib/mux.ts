// lib/mux.ts
// Mux API helpers for Qasberry.
// Handles direct upload URL creation and signed playback token generation.
//
// Env vars required:
//   MUX_TOKEN_ID        — Mux API token ID (from Mux dashboard > Settings > API Tokens)
//   MUX_TOKEN_SECRET    — Mux API token secret
//   MUX_SIGNING_KEY_ID  — Mux signing key ID (for signed playback tokens)
//   MUX_SIGNING_PRIVATE_KEY — Mux signing key (base64-encoded private key)

import Mux from '@mux/mux-node'
import jwt from 'jsonwebtoken'

// Security: Mux client is only ever instantiated server-side — never exposed to the client.
const muxClient = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export const { video } = muxClient

/**
 * Creates a Mux direct upload URL.
 * The admin uploads the video file directly from the browser to Mux —
 * the video bytes never pass through our server, keeping bandwidth costs zero.
 *
 * Returns: { uploadId, uploadUrl }
 */
export async function createMuxUpload(): Promise<{
  uploadId: string
  uploadUrl: string
}> {
  const upload = await video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL ?? '*',
    new_asset_settings: {
      playback_policy: ['signed'], // Security: signed-only — no public playback URLs
      encoding_tier: 'smart',
    },
  })

  return {
    uploadId: upload.id,
    uploadUrl: upload.url,
  }
}

/**
 * Retrieves a Mux upload by ID (used to find the asset ID after upload completes).
 */
export async function getMuxUpload(uploadId: string) {
  return video.uploads.retrieve(uploadId)
}

/**
 * Retrieves a Mux asset by ID.
 */
export async function getMuxAsset(assetId: string) {
  return video.assets.retrieve(assetId)
}

/**
 * Deletes a Mux asset by ID.
 * Called when a lesson is deleted from an admin's course.
 */
export async function deleteMuxAsset(assetId: string): Promise<void> {
  await video.assets.delete(assetId)
}

/**
 * Mints a short-lived signed-playback JWT for one Mux playback ID, per Mux's
 * documented signed-URL format (a `playback_policy: ['signed']` asset — see
 * createMuxUpload above — is unplayable without one).
 *
 * Pure/synchronous — no DB or network calls. Callers are responsible for
 * verifying the requester is actually enrolled/entitled to watch this
 * playback ID *before* calling this (see app/api/learn/[courseId]/[lessonId]/
 * playback-token/route.ts, which does that check first).
 */
export function createPlaybackToken(playbackId: string, userId: string): string {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID!
  const signingPrivateKey = Buffer.from(process.env.MUX_SIGNING_PRIVATE_KEY!, 'base64').toString('utf-8')

  return jwt.sign(
    {
      sub: playbackId,
      aud: 'v', // 'v' = video playback (vs. 't' thumbnail / 'g' gif / 'm' storyboard)
      // Included for Mux-side analytics/audit only — not required for the signature itself.
      user_id: userId,
    },
    signingPrivateKey,
    {
      algorithm: 'RS256',
      keyid: signingKeyId,
      expiresIn: '4h',
    }
  )
}
