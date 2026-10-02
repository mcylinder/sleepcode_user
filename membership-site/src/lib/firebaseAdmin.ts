import { NextRequest, NextResponse } from 'next/server';
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function adminApp(): App {
  if (getApps().length) return getApp();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('Missing required environment variable: FIREBASE_SERVICE_ACCOUNT');
  }
  return initializeApp({ credential: cert(parseServiceAccount(raw)) });
}

// Accepts the key file's JSON as one line, or pasted with real line breaks inside
// private_key (common when copying into .env files or the Vercel dashboard).
function parseServiceAccount(raw: string): object {
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(raw.replace(/\r?\n/g, '\\n'));
  }
}

export function adminAuth() {
  return getAuth(adminApp());
}

export function adminDb() {
  return getFirestore(adminApp());
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export interface AuthedUser {
  uid: string;
  email: string | null;
  // Seconds since epoch when the user last actually signed in (not a token refresh).
  authTime: number;
}

export async function requireUser(request: NextRequest): Promise<AuthedUser> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Not signed in');

  const authClient = adminAuth();
  try {
    const decoded = await authClient.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null, authTime: decoded.auth_time };
  } catch {
    throw new HttpError(401, 'Session expired, please sign in again');
  }
}

export function errorResponse(error: unknown, context: string) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`${context}:`, error);
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
