# SleepCoding Website

The SleepCoding website: marketing pages, accounts, a paid membership, and the in-browser player.

## Features

- **Accounts:** Firebase Auth with email/password, Google, Apple, and Facebook. Password reset, email verification, and linking several sign-in methods to one account.
- **Membership:** one paid tier, $7/month or $49/year, sold on this site with Stripe Checkout. Members manage billing in the Stripe Customer Portal.
- **Free and members-only sessions:** sessions flagged `free` in the catalog are open to every signed-in user. All others need a membership.
- **Account page:** membership status, profile, sign-in methods, password, and account deletion.
- **Player:** `/application` lets users pick a session, instructor voice, and soundscape, then play them together.

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Firebase Auth and Firestore (client SDK and Admin SDK)
- Stripe (Checkout, Customer Portal, webhooks)
- AWS SES for the contact form
- Session, instructor, and soundscape catalog from `https://app.sleepcoding.me`

## Getting started

```bash
npm install
npm run dev
```

Create `.env.local` with the variables listed in [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md), which also covers the Stripe, Firebase, and catalog setup.

## How membership works

1. A signed-in user starts checkout from the pricing or account page. `POST /api/billing/checkout` creates a Stripe Checkout Session.
2. Stripe calls `POST /api/billing/webhook`. The webhook re-reads the customer's subscriptions from Stripe and writes the result to `users/{uid}.membership` in Firestore.
3. The `useMembership` hook listens to that document, so the account page and session locks update as soon as the webhook lands.
4. Members open the Stripe Customer Portal via `POST /api/billing/portal` to switch plans, update their card, or cancel. Those changes arrive through the same webhook.

Only the server writes `membership` and `stripeCustomerId`. `firestore.rules` blocks clients from changing them.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── account/delete/      # Deletes the user's data, Stripe subscription, and login
│   │   ├── billing/checkout/    # Starts Stripe Checkout
│   │   ├── billing/portal/      # Opens the Stripe Customer Portal
│   │   ├── billing/webhook/     # Syncs Stripe subscription state to Firestore
│   │   ├── sessions/            # Catalog proxy (includes the free flag)
│   │   └── ...                  # instructors, soundscapes, contact, audio proxy, auth proxy
│   ├── account/                 # Account page
│   ├── application/             # Player flow (session, instructor, soundscape, player)
│   ├── login/                   # Sign in, sign up, password reset
│   ├── pricing/                 # Free vs Membership
│   └── ...                      # Marketing and legal pages
├── components/account/          # Account page sections and the re-sign-in dialog
├── contexts/AuthContext.tsx     # Auth state and sign-in actions
├── hooks/useMembership.ts       # Live membership status
└── lib/
    ├── firebase.ts              # Client Firebase
    ├── firebaseAdmin.ts         # Admin Firebase and requireUser()
    ├── stripe.ts                # Stripe client and membership sync
    ├── membership.ts            # Prices and shared membership types
    ├── authProviders.ts         # Social provider setup and account linking
    └── authErrors.ts            # Friendly auth error messages
```

## Deployment

Deploys on Vercel. Add every environment variable from [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md), point the Stripe webhook at `https://<your-domain>/api/billing/webhook`, and deploy `firestore.rules`.

## Support

Email contact@sleepcoding.me.
