import { NextResponse } from 'next/server';

interface SoundscapeData {
  id: number;
  name: string;
  description: string;
  type: 'environment' | 'noise' | 'music';
  audio_file: string;
  position: number;
  published?: number;
}

export async function GET() {
  try {
    const response = await fetch('https://sleepcoding.me/api/soundscapes', {
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

    const data = await response.json() as SoundscapeData[];
    
    // Filter to only published soundscapes and sort by position
    const publishedSoundscapes = data
      .filter((s) => s.published === 1)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return NextResponse.json(publishedSoundscapes);
  } catch (error) {
    console.error('Error fetching soundscapes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soundscapes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

