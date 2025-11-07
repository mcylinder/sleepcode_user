import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate that the URL is from our S3 bucket or CloudFront domain
    const CF_DOMAIN = process.env.CLOUDFRONT_DOMAIN;
    const allowedPrefixes = [
      'https://sleepcode-beta.s3.us-east-1.amazonaws.com/',
      ...(CF_DOMAIN ? [`https://${CF_DOMAIN}/`] : [])
    ];
    
    const isValidUrl = allowedPrefixes.some(prefix => url.startsWith(prefix));
    if (!isValidUrl) {
      console.warn('Invalid URL prefix:', url, 'Allowed prefixes:', allowedPrefixes);
      return NextResponse.json(
        { error: `Invalid URL. Only sleepcode-beta S3 or CloudFront URLs are allowed. Got: ${url.substring(0, 100)}...` },
        { status: 400 }
      );
    }

    // Determine content type based on URL
    const isJson = url.endsWith('.json');
    const acceptHeader = isJson ? 'application/json' : 'audio/*';

    // Fetch the file from S3
    console.log('Proxying request to S3:', url);
    const response = await fetch(url, {
      headers: {
        'Accept': acceptHeader,
      },
      // Don't follow redirects automatically
      redirect: 'follow',
    });

    console.log('S3 response status:', response.status, response.statusText);
    console.log('S3 response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error response');
      console.error('S3 fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url,
        errorText: errorText.substring(0, 500), // Limit error text length
      });
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.status} ${response.statusText}`, details: errorText.substring(0, 500) },
        { status: response.status }
      );
    }

    // Handle JSON files
    if (isJson) {
      const jsonData = await response.json();
      return NextResponse.json(jsonData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      });
    }

    // Handle audio files
    const arrayBuffer = await response.arrayBuffer();

    // Return the audio file with appropriate headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
        'Content-Length': response.headers.get('Content-Length') || arrayBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Error proxying audio:', error);
    return NextResponse.json(
      { error: 'Failed to proxy audio file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

