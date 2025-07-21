# SleepCode Membership Support Website

A modern, responsive membership support website built with Next.js, Firebase Authentication, and RevenueCat integration for subscription management.

## Features

- **Authentication**: Firebase Auth with social logins (Google, Facebook, Apple) and email/password
- **Subscription Management**: RevenueCat REST API integration for subscription status
- **Protected Routes**: Dashboard with user authentication required
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Clean UI**: Minimal design with square corners (no rounded borders)
- **Public Pages**: Homepage, Pricing, FAQ, Contact, Terms, Privacy

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS (customized for square corners)
- **Authentication**: Firebase Authentication
- **Database**: Firestore (ready for Phase 2 expansion)
- **Subscription**: RevenueCat REST API
- **Hosting**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- RevenueCat account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd membership-site
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCn51coB3MJH-uP6iX37ErpkKDcZC40oaA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sleepcodingbase.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sleepcodingbase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sleepcodingbase.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=2186950665
NEXT_PUBLIC_FIREBASE_APP_ID=1:2186950665:web:87ab81aa19f8cc17f120d8
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6J693D0VCT

# RevenueCat Configuration
REVENUECAT_API_KEY=your_revenuecat_api_key_here
```

**⚠️ IMPORTANT:** The `.env.local` file is already in `.gitignore` and will not be committed to your repository. This keeps your API keys secure.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with the following providers:
   - Email/Password
   - Google
   - Facebook
   - Apple
3. Get your Firebase configuration from Project Settings
4. Add your configuration to `.env.local`

## RevenueCat Setup

1. Create a RevenueCat account at [RevenueCat](https://www.revenuecat.com/)
2. Set up your app and products
3. Get your API key from the RevenueCat dashboard
4. Add your API key to `.env.local`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard page
│   ├── login/            # Authentication page
│   ├── pricing/          # Pricing page
│   ├── faq/              # FAQ page
│   ├── contact/          # Contact page
│   ├── terms/            # Terms of Service
│   ├── privacy/          # Privacy Policy
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   └── Navigation.tsx    # Main navigation
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
└── lib/                  # Utility libraries
    ├── firebase.ts       # Firebase configuration
    └── revenuecat.ts     # RevenueCat service
```

## Pages Overview

- **Homepage** (`/`): Landing page with features and call-to-action
- **Pricing** (`/pricing`): Free and premium plan comparison
- **FAQ** (`/faq`): Frequently asked questions
- **Contact** (`/contact`): Contact form and support information
- **Terms** (`/terms`): Terms of Service
- **Privacy** (`/privacy`): Privacy Policy
- **Login** (`/login`): Authentication page
- **Dashboard** (`/dashboard`): Protected user dashboard

## Authentication Flow

1. Users can sign up/sign in via:
   - Email and password
   - Google OAuth
   - Facebook OAuth
   - Apple OAuth
2. Successful authentication redirects to dashboard
3. Unauthenticated users trying to access dashboard are redirected to login
4. Logout redirects to homepage

## Subscription Integration

- Uses RevenueCat REST API to fetch subscription status
- Firebase UID is used as the `app_user_id` for RevenueCat
- Dashboard displays subscription status (Active, Expired, No Subscription)
- "Manage Subscription" link redirects to RevenueCat management page

## Customization

### Styling
- TailwindCSS is configured to remove rounded corners
- Custom utility classes are defined in `globals.css`
- Color scheme and spacing can be modified in `tailwind.config.ts`

### Content
- All page content is placeholder text and can be customized
- Legal pages (Terms, Privacy) contain realistic placeholder text
- Contact form is functional but doesn't actually submit (backend integration needed)

## Deployment

### Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
     - `REVENUECAT_API_KEY`

3. **Configure Firebase:**
   - Add your Vercel domain to Firebase Authentication authorized domains
   - Update Firebase project settings if needed

### Security Notes

- ✅ Firebase API keys are client-side safe (they're meant to be public)
- ✅ Server-side API keys (like RevenueCat) are kept secure via environment variables
- ✅ `.env.local` is in `.gitignore` to prevent accidental commits
- ⚠️ Always use environment variables for sensitive data in production

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Phase 2 Expansion

The project is structured to easily expand for Phase 2 features:
- User-created text-based data (journal entries)
- Firestore integration for data storage
- Enhanced dashboard with data management
- Additional user features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@sleepcode.com or create an issue in the repository.
