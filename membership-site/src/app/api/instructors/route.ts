import { NextResponse } from 'next/server';

interface InstructorData {
  id: number;
  name: string;
  description: string;
  elid: string;
  audio_preview: string;
  position: number;
  published?: number;
}

export async function GET() {
  try {
    const response = await fetch('https://app.sleepcoding.me/api/instructors', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as InstructorData[];
    
    // Filter to only published instructors and sort by position
    const publishedInstructors = data
      .filter((i) => i.published === 1)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return NextResponse.json(publishedInstructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

