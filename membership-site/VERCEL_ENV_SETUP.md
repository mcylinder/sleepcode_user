# Vercel Environment Variables Setup

## Required Environment Variables for Apple Sign-In:

### Frontend Variables (NEXT_PUBLIC_*):
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sleepcodingbase.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sleepcodingbase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sleepcodingbase.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=2186950665
NEXT_PUBLIC_FIREBASE_APP_ID=1:2186950665:web:87ab81aa19f8cc17f120d8
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6J693D0VCT
```

## Firebase Console Configuration:

### Apple Sign-In Setup:
1. **Go to Firebase Console** → Authentication → Sign-in method
2. **Enable Apple provider**
3. **Add your Apple Developer Team ID**
4. **Add your Apple Service ID** (sleepcoding.web.auth)
5. **Download the private key** from Apple Developer Console
6. **Upload the private key** to Firebase

## Apple Developer Console Configuration:

### Service ID Setup:
1. **Go to Apple Developer Console** → Certificates, Identifiers & Profiles
2. **Select your Service ID** (sleepcoding.web.auth)
3. **Enable "Sign In with Apple"**
4. **Add Return URLs:**
   - `https://sleepcodingbase.firebaseapp.com/__/auth/handler`
   - `https://your-vercel-domain.vercel.app/__/auth/handler`

## Testing Checklist:
- [ ] Firebase environment variables set in Vercel
- [ ] Apple provider enabled in Firebase Console
- [ ] Apple Service ID configured in Apple Developer Console
- [ ] Apple Sign-In button appears
- [ ] No console errors
- [ ] Authentication flow completes
- [ ] User data properly stored in Firebase Auth 