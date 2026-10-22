import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, HttpError, optionalUser } from '@/lib/firebaseAdmin';
import { findSession } from '@/lib/catalog';
import { isMemberOnServer } from '@/lib/stripe';
import { signPrefix } from '@/lib/cloudfront';

export const runtime = 'nodejs';

// Longer than the longest session timer, so access never lapses mid-session.
const TTL_SECONDS = 9 * 60 * 60;

// Returns one signature that unlocks every file in a session's folder.
// Free sessions are signed without an account; paid sessions still require membership.
export async function POST(request: NextRequest) {
  try {
    const user = await optionalUser(request);
    const { sessionId } = (await request.json().catch(() => ({}))) as { sessionId?: unknown };
    const session = typeof sessionId === 'string' ? findSession(sessionId) : null;
    if (!session) throw new HttpError(404, 'That session doesn\u2019t exist.');

    if (!session.free) {
      if (!user) throw new HttpError(401, 'Not signed in');
      if (!(await isMemberOnServer(user.uid))) {
        throw new HttpError(403, 'This session is part of SleepCode+.');
      }
    }

    return NextResponse.json(signPrefix(`session/${session.id}/`, TTL_SECONDS));
  } catch (error) {
    return errorResponse(error, 'Error signing session media');
  }
}
