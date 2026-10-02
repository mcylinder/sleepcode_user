import { NextRequest, NextResponse } from 'next/server';
import { adminDb, errorResponse, HttpError, requireUser } from '@/lib/firebaseAdmin';
import { getOrCreateCustomer, priceIdFor, siteUrl, stripe } from '@/lib/stripe';
import type { BillingInterval } from '@/lib/membership';

export const runtime = 'nodejs';

const BLOCKING_STATUSES = ['active', 'trialing', 'past_due', 'unpaid'];

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { interval } = (await request.json().catch(() => ({}))) as { interval?: BillingInterval };
    if (interval !== 'month' && interval !== 'year') {
      throw new HttpError(400, 'Choose monthly or yearly billing');
    }

    const userDoc = await adminDb().collection('users').doc(user.uid).get();
    if (BLOCKING_STATUSES.includes(userDoc.get('membership.status'))) {
      throw new HttpError(409, 'You already have a membership. Use Manage billing to change it.');
    }

    const customerId = await getOrCreateCustomer(user.uid, user.email);
    const base = siteUrl(request.nextUrl.origin);

    const session = await stripe().checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.uid,
      line_items: [{ price: priceIdFor(interval), quantity: 1 }],
      subscription_data: { metadata: { firebaseUid: user.uid } },
      allow_promotion_codes: true,
      success_url: `${base}/account?checkout=success`,
      cancel_url: `${base}/pricing`,
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return errorResponse(error, 'Checkout error');
  }
}
