import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, HttpError, requireUser } from '@/lib/firebaseAdmin';
import { getStripeCustomerId, siteUrl, stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const customerId = await getStripeCustomerId(user.uid);
    if (!customerId) {
      throw new HttpError(400, 'No billing account yet. Become a member first.');
    }

    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl(request.nextUrl.origin)}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return errorResponse(error, 'Billing portal error');
  }
}
