import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables only
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only on client side and with valid config
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let facebookProvider: FacebookAuthProvider | null = null;
let appleProvider: OAuthProvider | null = null;

if (typeof window !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    appleProvider = new OAuthProvider('apple.com');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { auth, db, googleProvider, facebookProvider, appleProvider };
export default app;

// Enhanced Apple Sign-In with detailed error logging
export const startAppleSignIn = async () => {
  if (!auth || !appleProvider) {
    console.error('Firebase not initialized. Please check your environment variables.');
    throw new Error('Firebase not initialized');
  }

  try {
    console.log('Starting Apple sign-in redirect...');
    await signInWithRedirect(auth, appleProvider);
  } catch (err) {
    console.error('Apple sign-in initiation error:', {
      error: err,
      code: (err as { code?: string })?.code,
      message: (err as Error)?.message,
      customData: (err as { customData?: unknown })?.customData,
      stack: (err as Error)?.stack
    });
    throw err;
  }
};

export const handleAppleRedirectResult = async () => {
  if (!auth) {
    console.error('Firebase not initialized for redirect result handling');
    return null;
  }

  try {
    console.log('Checking for Apple redirect result...');
    const result = await getRedirectResult(auth);
    
    if (result) {
      console.log('Apple login success:', {
        user: result.user,
        operationType: result.operationType
      });
      return result;
    } else {
      console.log('No Apple redirect result found');
      return null;
    }
  } catch (err) {
    console.error('Apple redirect result error:', {
      error: err,
      code: (err as { code?: string })?.code,
      message: (err as Error)?.message,
      customData: (err as { customData?: unknown })?.customData,
      stack: (err as Error)?.stack
    });
    throw err;
  }
}; 