import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const revenueCatApiKey = process.env.REVENUECAT_API_KEY;
    
    if (!revenueCatApiKey) {
      return NextResponse.json(
        { error: 'RevenueCat API key not configured' },
        { status: 500 }
      );
    }

    // Call RevenueCat API to get subscriber information
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${revenueCatApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`RevenueCat API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
} 