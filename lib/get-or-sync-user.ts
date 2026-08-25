// lib/get-or-sync-user.ts
// Returns the DB User for the given Clerk ID.
// If the record doesn't exist yet (e.g. the Clerk webhook was never received),
// it fetches the user from Clerk and creates the DB record on the fly —
// making enrollment and other user-scoped APIs resilient to missed webhooks.

import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import type { User } from '@prisma/client'
import type { UserRole } from '@/types'

export async function getOrSyncUser(clerkId: string): Promise<User | null> {
  // 1. Fast path — user already exists in DB
  const existing = await db.user.findUnique({ where: { clerkId } })
  if (existing) return existing

  // 2. Slow path — user is in Clerk but hasn't been synced yet.
  //    Fetch from Clerk and create the record.
  try {
    const clerk     = await clerkClient()
    const clerkUser = await clerk.users.getUser(clerkId)

    const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress
    if (!primaryEmail) {
      console.warn(`[getOrSyncUser] No email for clerkId=${clerkId}, cannot sync.`)
      return null
    }

    const name: string | null =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || null

    const role: UserRole =
      (clerkUser.publicMetadata?.role as UserRole | undefined) ?? 'STUDENT'

    const user = await db.user.upsert({
      where:  { clerkId },
      update: {},                                    // already exists — no-op
      create: { clerkId, email: primaryEmail, name, role },
    })

    console.log(`[getOrSyncUser] Auto-synced user clerkId=${clerkId} → dbId=${user.id}`)
    return user
  } catch (err) {
    console.error(`[getOrSyncUser] Failed to sync clerkId=${clerkId}:`, err)
    return null
  }
}
