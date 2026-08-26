// app/api/admin/careers/route.ts
// Admin API: List all careers (for course creation dropdown).
// Public-ish — any signed-in admin can fetch this.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUserRole } from '@/lib/auth'
import type { UserRole, ApiResponse } from '@/types'

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const auth = await getAuthenticatedUserRole()
  if (!auth) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!(['SUPER_ADMIN', 'CONTENT_MANAGER', 'MODERATOR'] as UserRole[]).includes(auth.role)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const careers = await db.career.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    })
    return NextResponse.json({ success: true, data: careers })
  } catch (err) {
    console.error('GET /api/admin/careers error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to fetch careers' }, { status: 500 })
  }
}
