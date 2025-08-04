# Apple Sign-In Troubleshooting Guide

## Enhanced Error Logging Implementation

The code has been updated with enhanced error logging to help diagnose Apple Sign-In issues on Vercel deployment.

### What's Been Added:

1. **Enhanced Firebase Functions** (`src/lib/firebase.ts`):
   - `startAppleSignIn()` - Initiates Apple sign-in with detailed error logging
   - `handleAppleRedirectResult()` - Handles redirect results with comprehensive error capture

2. **Updated AuthContext** (`src/contexts/AuthContext.tsx`):
   - Switched from `signInWithPopup` to `signInWithRedirect` for Apple
   - Added redirect result handling in `useEffect`

3. **Debug Component** (`src/components/AppleSignInDebug.tsx`):
   - Comprehensive diagnostic tool
   - Collects browser, platform, URL, and Firebase configuration info
   - Available as a floating button on the login page

4. **Enhanced Login Page** (`src/app/login/page.tsx`):
   - Added detailed console logging for Apple sign-in attempts
   - Includes the debug component

## Common Apple Sign-In Issues & Solutions

### 1. Firebase Configuration Issues

**Check these environment variables in Vercel:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Verify in Firebase Console:**
- Go to Authentication > Sign-in method
- Ensure Apple provider is enabled
- Check that your domain is added to authorized domains

### 2. Apple Developer Account Configuration

**In Apple Developer Console:**
1. Go to Certificates, Identifiers & Profiles
2. Create/verify your App ID
3. Enable "Sign In with Apple" capability
4. Create a Services ID for your domain
5. Configure the Services ID with your domain and redirect URLs

**Required URLs for Apple Sign-In:**
```
https://your-domain.vercel.app
https://your-domain.vercel.app/login
https://your-domain.vercel.app/callback
```

### 3. Domain Configuration Issues

**Common Problems:**
- Domain not added to Firebase authorized domains
- Incorrect redirect URLs in Apple Developer Console
- HTTPS required for Apple Sign-In

**Solutions:**
1. Add your Vercel domain to Firebase Console > Authentication > Settings > Authorized domains
2. Ensure all redirect URLs in Apple Developer Console match your Vercel domain
3. Verify HTTPS is working correctly

### 4. Browser/Platform Issues

**Apple Sign-In Requirements:**
- Safari on iOS/macOS (best compatibility)
- Chrome/Firefox on macOS (limited support)
- Mobile Safari (full support)
- Desktop browsers other than Safari (may not work)

**Testing Strategy:**
1. Test on Safari (macOS/iOS) first
2. Test on mobile Safari
3. Check console logs for specific error messages

### 5. Network/Redirect Issues

**Common Error Codes:**
- `auth/unauthorized-domain` - Domain not authorized in Firebase
- `auth/operation-not-allowed` - Apple provider not enabled
- `auth/network-request-failed` - Network connectivity issues
- `auth/popup-closed-by-user` - User closed popup (shouldn't happen with redirect)

## Debugging Steps

### Step 1: Use the Debug Component
1. Go to your login page
2. Click the "Debug Apple Sign-In" button (bottom-right)
3. Copy the debug information
4. Check for any obvious configuration issues

### Step 2: Check Console Logs
Open browser developer tools and look for:
- "Starting Apple sign-in redirect..."
- "Apple sign-in initiation error:"
- "Apple redirect result error:"
- "Apple login success:"

### Step 3: Verify Firebase Configuration
1. Check Firebase Console > Authentication > Sign-in method
2. Ensure Apple provider is enabled
3. Verify authorized domains include your Vercel domain

### Step 4: Test on Different Platforms
1. **Safari (macOS/iOS)** - Primary testing platform
2. **Mobile Safari** - Full Apple Sign-In support
3. **Chrome/Firefox** - Limited support, may not work

### Step 5: Check Apple Developer Console
1. Verify Services ID configuration
2. Check redirect URLs match your domain
3. Ensure "Sign In with Apple" capability is enabled

## Error Code Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/unauthorized-domain` | Domain not in Firebase authorized domains | Add domain to Firebase Console |
| `auth/operation-not-allowed` | Apple provider not enabled | Enable in Firebase Console |
| `auth/network-request-failed` | Network connectivity issue | Check internet connection |
| `auth/popup-closed-by-user` | User closed popup | Use redirect instead of popup |
| `auth/cancelled-popup-request` | Multiple popup requests | Use redirect instead of popup |

## Testing Checklist

- [ ] Environment variables set in Vercel
- [ ] Firebase Apple provider enabled
- [ ] Domain added to Firebase authorized domains
- [ ] Apple Developer Console configured
- [ ] Testing on Safari (macOS/iOS)
- [ ] Console logs showing detailed errors
- [ ] Debug component showing configuration
- [ ] HTTPS working correctly
- [ ] No ad blockers interfering

## Next Steps

1. Deploy the updated code to Vercel
2. Test Apple Sign-In on Safari
3. Check console logs for detailed error messages
4. Use the debug component to gather configuration info
5. Share specific error codes/messages for further diagnosis

The enhanced error logging will provide much more detailed information about what's failing during the Apple Sign-In process. 