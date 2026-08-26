// app/api/admin/mux/upload/route.ts
// Creates a Mux direct upload URL for admin video uploads.
//
// The flow:
//   1. Admin clicks "Upload Video" in the lesson form
//   2. This endpoint calls the Mux API to create a direct upload URL
//   3. The frontend uploads the video file directly from the browser to Mux (NOT through our server)
//   4. When Mux finishes processing, it fires a webhook to /api/webhooks/mux
//   5. The webhook saves muxAssetId, muxPlaybackId, and duration back to the Lesson record
//
// Security: only SUPER_ADMIN and CONTENT_MANAGER can create upload URLs.
// Env vars: MUX_TOKEN_ID, MUX_TOKEN_SECRET

import { NextRequest, NextResponse } from 'next/server'
import { createMuxUpload } from '@/lib/mux'
import { getAuthenticatedUserRole } from '@/lib/auth'
import type { UserRole, ApiResponse } from '@/types'

const COURSE_MANAGER_ROLES: UserRole[] = ['SUPER_ADMIN', 'CONTENT_MANAGER']

export async function POST(_req: NextRequest): Promise<NextResponse> {
  // Step 1 + 2: Verify auth and role (reads live from Clerk — session JWT does not carry publicMetadata)
  const auth = await getAuthenticatedUserRole()
  if (!auth) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!COURSE_MANAGER_ROLES.includes(auth.role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { uploadId, uploadUrl } = await createMuxUpload()

    // Return the upload URL and ID — the frontend uses uploadUrl to PUT the video file directly
    // uploadId is stored temporarily so we can correlate the webhook event to the lesson
    return NextResponse.json({
      success: true,
      data: { uploadId, uploadUrl },
    })
  } catch (err) {
    console.error('POST /api/admin/mux/upload error:', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create Mux upload URL' },
      { status: 500 }
    )
  }
}
