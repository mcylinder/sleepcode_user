import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
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

// Ensure we have the minimum required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is incomplete. Please check your environment variables.');
}

// Initialize Firebase only on client side and with valid config
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let facebookProvider: FacebookAuthProvider | null = null;
let appleProvider: OAuthProvider | null = null;

if (typeof window !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    console.log('Initializing Firebase with config:', {
      apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      hasAppId: !!firebaseConfig.appId
    });
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    facebookProvider = new FacebookAuthProvider();
    appleProvider = new OAuthProvider('apple.com');
    
    console.log('Firebase initialized successfully:', {
      hasApp: !!app,
      hasAuth: !!auth,
      hasAppleProvider: !!appleProvider
    });
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase initialization skipped:', {
    isClient: typeof window !== 'undefined',
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId
  });
}

export { auth, db, googleProvider, facebookProvider, appleProvider };
export default app; 