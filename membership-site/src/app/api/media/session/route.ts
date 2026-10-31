import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, HttpError, optionalUser } from '@/lib/firebaseAdmin';
import { findSession, findVoice } from '@/lib/catalog';
import { isMemberOnServer } from '@/lib/stripe';
import { signPrefix } from '@/lib/cloudfront';

export const runtime = 'nodejs';

// Longer than the longest session timer, so access never lapses mid-session.
const TTL_SECONDS = 9 * 60 * 60;

// Returns one signature that unlocks every file in a voice+session folder.
// Free sessions are signed without an account; paid sessions still require membership.
export async function POST(request: NextRequest) {
  try {
    const user = await optionalUser(request);
    const body = (await request.json().catch(() => ({}))) as {
      sessionId?: unknown;
      voiceId?: unknown;
    };
    const session = typeof body.sessionId === 'string' ? findSession(body.sessionId) : null;
    if (!session) throw new HttpError(404, 'That session doesn\u2019t exist.');
    const voice = typeof body.voiceId === 'string' ? findVoice(body.voiceId) : null;
    if (!voice) throw new HttpError(404, 'That voice isn\u2019t available.');

    if (!session.free) {
      if (!user) throw new HttpError(401, 'Not signed in');
      if (!(await isMemberOnServer(user.uid))) {
        throw new HttpError(403, 'This session is part of SleepCode+.');
      }
    }

    return NextResponse.json(signPrefix(`session/${voice.id}/${session.id}/`, TTL_SECONDS));
  } catch (error) {
    return errorResponse(error, 'Error signing session media');
  }
}
