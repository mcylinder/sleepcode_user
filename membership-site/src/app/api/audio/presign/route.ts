import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

// Force Node runtime (cloudfront-signer uses Node crypto)
export const runtime = 'nodejs';

// Environment variables (configured in Vercel)
const CF_DOMAIN = process.env.CLOUDFRONT_DOMAIN as string;
const CF_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID as string;
const CF_PRIVATE_KEY_RAW = process.env.CLOUDFRONT_PRIVATE_KEY as string;
const FIREBASE_SA = process.env.FIREBASE_SERVICE_ACCOUNT as string;

// Basic presence checks early for clearer error messages at runtime
function assertEnv(value: string | undefined, name: string): asserts value is string {
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

assertEnv(CF_DOMAIN, 'CLOUDFRONT_DOMAIN');
assertEnv(CF_KEY_PAIR_ID, 'CLOUDFRONT_KEY_PAIR_ID');
assertEnv(CF_PRIVATE_KEY_RAW, 'CLOUDFRONT_PRIVATE_KEY');
assertEnv(FIREBASE_SA, 'FIREBASE_SERVICE_ACCOUNT');

// Normalize PEM if it was pasted with literal "\n"
const CF_PRIVATE_KEY = CF_PRIVATE_KEY_RAW.replace(/\\n/g, '\n');

// Initialize Firebase Admin once
if (!getApps().length) {
  const svc = JSON.parse(FIREBASE_SA);
  initializeApp({ credential: cert(svc) });
}

function badReq(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}

export async function OPTIONS() {
  // If your app calls from a different origin, loosen CORS here.
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1) Auth: Firebase ID token (Authorization: Bearer <token>)
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return badReq('Missing Authorization Bearer token', 401);

    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    // 2) Input
    const body = await req.json().catch(() => ({} as unknown));
    const filename = (body as Record<string, unknown>)?.['filename'] as string | undefined;
    const trimmed = filename?.trim();
    if (!trimmed) return badReq('filename required');
    if (trimmed.includes('/') || trimmed.includes('..')) return badReq('invalid filename');

    // 3) Build path (never accept a full path from client)
    const path = `/users/${uid}/${trimmed}`;
    const assetUrl = `https://${CF_DOMAIN}${path}`;

    // 4) Sign CloudFront URL (simple policy w/ expiry)
    const ttlSeconds = 60 * 5; // 5 minutes
    const signed = getSignedUrl({
      url: assetUrl,
      keyPairId: CF_KEY_PAIR_ID,
      privateKey: CF_PRIVATE_KEY,
      dateLessThan: new Date(Date.now() + ttlSeconds * 1000),
    });

    // 5) Response
    return NextResponse.json(
      { url: signed, expiresIn: ttlSeconds },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (err) {
    console.error('presign error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}


