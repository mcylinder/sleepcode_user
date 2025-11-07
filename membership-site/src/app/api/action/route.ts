import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userID,
      instructor,
      soundscape,
      instruction,
      action,
      timerMinutes,
      intensitySegments,
      crossfade
    } = body;

    // Log analytics event (in production, you'd send this to your analytics service)
    console.log('Analytics Event:', {
      userID,
      instructor: instructor ? { id: instructor.id, name: instructor.name } : null,
      soundscape: soundscape ? { id: soundscape.id, name: soundscape.name || soundscape.title } : null,
      instruction: instruction ? {
        id: instruction.id,
        ins_id: instruction.ins_id,
        title: instruction.title || instruction.name,
        type: instruction.type
      } : null,
      action, // 'play', 'pause', 'leave'
      timerMinutes,
      intensitySegments, // Focus/Immersive slider value
      crossfade, // Crossfade slider value (0-100)
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // In production, you would:
    // - Send to your analytics service (e.g., Google Analytics, Mixpanel, etc.)
    // - Store in a database for analysis
    // - Send to a webhook endpoint

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't fail the request - analytics should be non-blocking
    return NextResponse.json({ success: false, error: 'Failed to track analytics' }, { status: 500 });
  }
}

