import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface SessionData {
  id: number;
  name: string;
  description: string;
  ins_id: string;
  position: number;
  published?: number;
}

export async function GET() {
  try {
    const response = await fetch('https://sleepcoding.me/api/instructions', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as SessionData[];
    
    if (!Array.isArray(data)) {
      console.error('Expected array but got:', typeof data);
      return NextResponse.json(
        { error: 'Invalid data format from external API' },
        { status: 500 }
      );
    }
    
    // Filter to only published sessions and sort by position
    const publishedSessions = data
      .filter((s) => s.published === 1)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return NextResponse.json(publishedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error stack:', errorStack);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: errorMessage },
      { status: 500 }
    );
  }
}
