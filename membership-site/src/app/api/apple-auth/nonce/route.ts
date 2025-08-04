import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  try {
    // Generate a new random string for each sign-in
    const generateNonce = (length: number = 32): string => {
      const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return result;
    };

    const unhashedNonce = generateNonce(32);
    
    // SHA256-hashed nonce in hex
    const hashedNonceHex = crypto.createHash('sha256')
      .update(unhashedNonce).digest().toString('hex');

    return NextResponse.json({
      hashedNonce: hashedNonceHex,
      rawNonce: unhashedNonce
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
} 