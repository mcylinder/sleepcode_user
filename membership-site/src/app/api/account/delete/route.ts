import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, errorResponse, HttpError, requireUser } from '@/lib/firebaseAdmin';
import { cancelAllSubscriptions, getStripeCustomerId } from '@/lib/stripe';

export const runtime = 'nodejs';

const RECENT_SIGN_IN_SECONDS = 5 * 60;

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (Date.now() / 1000 - user.authTime > RECENT_SIGN_IN_SECONDS) {
      throw new HttpError(401, 'For your security, please sign in again to delete your account.');
    }

    const customerId = await getStripeCustomerId(user.uid);
    if (customerId) {
      await cancelAllSubscriptions(customerId);
    }

    const db = adminDb();
    await db.recursiveDelete(db.collection('users').doc(user.uid));
    await adminAuth().deleteUser(user.uid);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return errorResponse(error, 'Account deletion error');
  }
}
