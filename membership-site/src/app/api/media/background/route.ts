import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/firebaseAdmin';
import { signPrefix } from '@/lib/cloudfront';

export const runtime = 'nodejs';

// Longer than the longest session timer, so access never lapses mid-session.
const TTL_SECONDS = 9 * 60 * 60;

// Backgrounds are included with listening (not sold separately). Any caller may
// receive a short-TTL signature for files under background/.
export async function POST() {
  try {
    return NextResponse.json(signPrefix('background/', TTL_SECONDS));
  } catch (error) {
    return errorResponse(error, 'Error signing background media');
  }
}
