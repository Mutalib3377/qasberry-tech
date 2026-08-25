// app/api/payments/initiate/route.ts
// Initiate a Stripe Checkout Session for a paid course.
// POST body: { courseId: string }
// Returns: { success: true, url: string } — Stripe hosted checkout URL
// Env: STRIPE_SECRET_KEY, NEXT_PUBLIC_APP_URL

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db }   from '@/lib/db'
import { z }    from 'zod'
import Stripe   from 'stripe'
import { getOrSyncUser } from '@/lib/get-or-sync-user'
import type { ApiResponse } from '@/types'

const BodySchema = z.object({ courseId: z.string().min(1) })

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = BodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request' }, { status: 400 })
  }

  const { courseId } = parsed.data
  const secretKey    = process.env.STRIPE_SECRET_KEY
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const [user, course] = await Promise.all([
    getOrSyncUser(clerkId),
    db.course.findUnique({ where: { id: courseId } }),
  ])

  if (!user) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'User not found. Please sign out and sign in again.' }, { status: 404 })
  }
  if (!course) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Course not found' }, { status: 404 })
  }

  // Already enrolled — redirect straight to learn
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })
  if (existing) {
    return NextResponse.json({ success: true, url: `${appUrl}/learn/${courseId}` })
  }

  // No Stripe key — create enrollment immediately for dev/demo
  if (!secretKey || secretKey.includes('REPLACE_ME')) {
    await db.enrollment.create({ data: { userId: user.id, courseId, paymentRef: 'DEMO' } })
    return NextResponse.json({ success: true, url: `${appUrl}/learn/${courseId}` })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' })

  // Stripe uses the smallest currency unit (cents for USD)
  const amountCents = Math.round(Number(course.price) * 100)

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      customer_email:       user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency:     'usd',
            unit_amount:  amountCents,
            product_data: {
              name:        course.title,
              description: `Enrol in ${course.title} on Qasberry`,
            },
          },
        },
      ],
      metadata: {
        courseId,
        userId: user.id,
      },
      success_url: `${appUrl}/api/payments/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/courses`,
    })

    return NextResponse.json({ success: true, url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Payment gateway error' }, { status: 502 })
  }
}
