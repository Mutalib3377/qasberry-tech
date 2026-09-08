// app/api/admin/mux/upload/[uploadId]/route.ts
// Resolves a Mux direct-upload ID to its resulting asset ID, and confirms it
// onto a lesson.
//
// Why this exists (not in the original P2/P7 file list, added because the
// upload flow is non-functional without it — see the P7 report): a Mux
// direct upload and the asset it produces have different IDs. The existing,
// unmodified webhook (app/api/webhooks/mux/route.ts) matches incoming
// video.asset.ready/errored events to a lesson by muxAssetId — so the client
// needs to learn the asset ID after PUTting the file to Mux, and the server
// needs to set it on the lesson, before the webhook has anything to match
// against. Mux's client is server-only (lib/mux.ts), so both steps have to
// go through a route: neither P2's original mux/upload/route.ts (which only
// creates the upload) nor the general lesson PATCH route are modified for
// this — this is a new, separate file.
//
// GET  — poll: has Mux resolved this upload to an asset yet?
// POST — confirm: re-resolve the asset ID server-side (never trust a
//        client-supplied one), delete the lesson's previous Mux asset if
//        this is a replace (using the existing, unmodified deleteMuxAsset()
//        from P2), then set the new muxAssetId on the lesson via a plain
//        update (same shape the general PATCH route already writes).
//
// Security: same admin role-gate as every other app/api/admin/ route.

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getMuxUpload, deleteMuxAsset } from '@/lib/mux'
import type { UserRole, ApiResponse } from '@/types'

type RouteContext = { params: { uploadId: string } }

async function getUserRole(userId: string): Promise<UserRole | undefined> {
  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  return (user.publicMetadata as { role?: UserRole })?.role
}

const COURSE_MANAGER_ROLES: UserRole[] = ['SUPER_ADMIN', 'CONTENT_MANAGER']

export async function GET(_req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !(['SUPER_ADMIN', 'CONTENT_MANAGER', 'MODERATOR'] as UserRole[]).includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const upload = await getMuxUpload(params.uploadId)
    return NextResponse.json({
      success: true,
      data: { status: upload.status, assetId: upload.asset_id ?? null },
    })
  } catch (err) {
    console.error('GET mux upload status error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to check upload status' }, { status: 500 })
  }
}

const confirmSchema = z.object({ lessonId: z.string().min(1) })

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(userId)
  if (!role || !COURSE_MANAGER_ROLES.includes(role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const parsed = confirmSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'lessonId is required' }, { status: 400 })
  }

  try {
    const upload = await getMuxUpload(params.uploadId)
    if (!upload.asset_id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Upload has not resolved to an asset yet' }, { status: 409 })
    }

    const lesson = await db.lesson.findUnique({
      where: { id: parsed.data.lessonId },
      select: { muxAssetId: true },
    })
    if (!lesson) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Lesson not found' }, { status: 404 })
    }

    const updated = await db.lesson.update({
      where: { id: parsed.data.lessonId },
      data: {
        muxAssetId: upload.asset_id,
        muxPlaybackId: null, // cleared until the video.asset.ready webhook fires for the new asset
        muxError: null,
        type: 'VIDEO',
      },
      select: { id: true, muxAssetId: true, type: true },
    })

    // Replace flow: best-effort delete of the lesson's previous Mux asset —
    // the lesson update above is the source of truth and already succeeded;
    // a failure here only leaks a billable asset, same non-blocking pattern
    // P2 uses for lesson-delete cleanup.
    if (lesson.muxAssetId && lesson.muxAssetId !== upload.asset_id) {
      try {
        await deleteMuxAsset(lesson.muxAssetId)
        console.log(`✅ Deleted replaced Mux asset ${lesson.muxAssetId} for lesson ${parsed.data.lessonId}`)
      } catch (cleanupErr) {
        console.error(`⚠️ Failed to delete replaced Mux asset ${lesson.muxAssetId} for lesson ${parsed.data.lessonId} (non-fatal):`, cleanupErr)
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error('POST mux upload confirm error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to confirm upload' }, { status: 500 })
  }
}
