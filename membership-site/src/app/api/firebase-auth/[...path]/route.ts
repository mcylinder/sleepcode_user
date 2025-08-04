import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  
  console.log('Firebase Auth proxy GET request:', {
    originalPath: path,
    cleanPath: path,
    firebaseUrl: `https://sleepcodingbase.firebaseapp.com/__/auth/${path}${searchParams ? `?${searchParams}` : ''}`,
    searchParams
  });
  
  // If this is a request for Firebase Auth JavaScript files, proxy them directly
  if (path.endsWith('.js')) {
    const scriptUrl = `https://sleepcodingbase.firebaseapp.com/__/auth/${path}`;
    console.log('Proxying script request:', scriptUrl);
    
    try {
      const scriptResponse = await fetch(scriptUrl);
      const scriptData = await scriptResponse.text();
      
      return new NextResponse(scriptData, {
        status: scriptResponse.status,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Script proxy error:', error);
      return new NextResponse('Script not found', { status: 404 });
    }
  }
  
  try {
    const firebaseUrl = `https://sleepcodingbase.firebaseapp.com/__/auth/${path}${searchParams ? `?${searchParams}` : ''}`;
    const response = await fetch(firebaseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'Accept': request.headers.get('accept') || '',
        'Accept-Language': request.headers.get('accept-language') || '',
      },
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Cache-Control': response.headers.get('cache-control') || 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Firebase Auth proxy error:', error);
    return new NextResponse('Firebase Auth proxy error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  
  const firebaseUrl = `https://sleepcodingbase.firebaseapp.com/__/auth/${path}${searchParams ? `?${searchParams}` : ''}`;
  
  try {
    const body = await request.text();
    
    const response = await fetch(firebaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/x-www-form-urlencoded',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body,
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Cache-Control': response.headers.get('cache-control') || 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Firebase Auth proxy error:', error);
    return new NextResponse('Firebase Auth proxy error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 