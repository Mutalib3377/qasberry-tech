// app/api/payments/verify/route.ts
// Stripe payment verification — called via redirect after successful checkout.
// GET ?session_id=xxx  →  retrieves Stripe session, creates Enrollment, redirects to learn page.
// Env: STRIPE_SECRET_KEY

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Stripe  from 'stripe'
import { sendEnrollmentEmail } from '@/lib/email'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard', appUrl))
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || secretKey.includes('REPLACE_ME')) {
    return NextResponse.redirect(new URL('/dashboard', appUrl))
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' })

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL('/dashboard?payment=failed', appUrl))
    }

    const { courseId, userId } = (session.metadata ?? {}) as { courseId?: string; userId?: string }

    if (!courseId || !userId) {
      console.error('[stripe-verify] Missing courseId or userId in session metadata', { sessionId })
      return NextResponse.redirect(new URL('/dashboard?payment=error', appUrl))
    }

    // Idempotent upsert — safe if user refreshes the success page
    const enrollment = await db.enrollment.upsert({
      where:  { userId_courseId: { userId, courseId } },
      update: { paymentRef: session.payment_intent as string },
      create: { userId, courseId, paymentRef: session.payment_intent as string },
      include: {
        user:   { select: { email: true, name: true } },
        course: { select: { title: true } },
      },
    })

    // Send enrollment confirmation email (best-effort)
    await sendEnrollmentEmail({
      to:          enrollment.user.email ?? session.customer_email ?? '',
      studentName: enrollment.user.name  ?? 'Student',
      courseTitle: enrollment.course.title,
      courseId,
    }).catch((err) => {
      console.error('[stripe-verify] Failed to send enrollment email:', err)
    })

    return NextResponse.redirect(new URL(`/learn/${courseId}`, appUrl))
  } catch (err) {
    console.error('Stripe verify error:', err)
    return NextResponse.redirect(new URL('/dashboard?payment=error', appUrl))
  }
}
