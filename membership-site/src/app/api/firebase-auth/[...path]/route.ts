import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  
  // Handle .js extension that Firebase SDK adds
  const cleanPath = path.endsWith('.js') ? path.slice(0, -3) : path;
  const firebaseUrl = `https://sleepcodingbase.firebaseapp.com/__/auth/${cleanPath}${searchParams ? `?${searchParams}` : ''}`;
  
  console.log('Firebase Auth proxy GET request:', {
    originalPath: path,
    cleanPath,
    firebaseUrl,
    searchParams
  });
  
  try {
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
  
  // Handle .js extension that Firebase SDK adds
  const cleanPath = path.endsWith('.js') ? path.slice(0, -3) : path;
  const firebaseUrl = `https://sleepcodingbase.firebaseapp.com/__/auth/${cleanPath}${searchParams ? `?${searchParams}` : ''}`;
  
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