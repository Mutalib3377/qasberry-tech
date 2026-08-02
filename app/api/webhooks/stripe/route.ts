// app/api/webhooks/stripe/route.ts
// Stripe server-to-server webhook — for guaranteed payment confirmation.
// Stripe sends this AFTER a checkout session completes (separate from the redirect flow).
//
// Security: Request signature is verified using stripe.webhooks.constructEvent()
// with STRIPE_WEBHOOK_SECRET. Never trust the event without verifying the signature.
//
// Events handled:
//   checkout.session.completed — create Enrollment idempotently

import { NextRequest, NextResponse } from 'next/server'
import Stripe  from 'stripe'
import { db } from '@/lib/db'
import { sendEnrollmentEmail } from '@/lib/email'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const secretKey     = process.env.STRIPE_SECRET_KEY

  if (!secretKey || secretKey.includes('REPLACE_ME')) {
    console.warn('[stripe-webhook] STRIPE_SECRET_KEY not set — skipping')
    return NextResponse.json({ received: true })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' })

  // ── Signature verification ───────────────────────────────────────────────────
  if (!webhookSecret || webhookSecret.includes('REPLACE_ME')) {
    // Webhook secret not configured — accept in dev/demo mode but log a warning
    console.warn('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature check')

    let event: Stripe.Event
    try {
      event = await req.json() as Stripe.Event
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    return handleEvent(stripe, event)
  }

  const sig     = req.headers.get('stripe-signature') ?? ''
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.warn('[stripe-webhook] Invalid signature — rejecting request', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  return handleEvent(stripe, event)
}

async function handleEvent(stripe: Stripe, event: Stripe.Event): Promise<NextResponse> {
  // Only handle completed checkout sessions
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true })
  }

  const { courseId, userId } = (session.metadata ?? {}) as { courseId?: string; userId?: string }

  if (!courseId || !userId) {
    console.warn('[stripe-webhook] Missing courseId or userId in session metadata', { sessionId: session.id })
    return NextResponse.json({ received: true })
  }

  try {
    // Idempotent upsert — Stripe may send the same event multiple times
    const enrollment = await db.enrollment.upsert({
      where:  { userId_courseId: { userId, courseId } },
      update: { paymentRef: session.payment_intent as string },
      create: { userId, courseId, paymentRef: session.payment_intent as string },
      include: {
        user:   { select: { email: true, name: true } },
        course: { select: { title: true } },
      },
    })

    console.log(`[stripe-webhook] Enrollment confirmed: user=${userId} course=${courseId}`)

    // Send enrollment confirmation email (best-effort — don't fail the webhook if email fails)
    await sendEnrollmentEmail({
      to:          enrollment.user.email ?? session.customer_email ?? '',
      studentName: enrollment.user.name  ?? 'Student',
      courseTitle: enrollment.course.title,
      courseId,
    }).catch((err) => {
      console.error('[stripe-webhook] Failed to send enrollment email:', err)
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe-webhook] DB error:', err)
    // Return 200 to Stripe so it doesn't retry — investigate separately
    return NextResponse.json({ received: true })
  }
}
