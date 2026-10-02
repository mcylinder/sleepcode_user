# SleepCode Website

The SleepCode website: marketing pages, accounts, a paid membership, and the in-browser player.

## Features

- **Accounts:** Firebase Auth with email/password, Google, Apple, and Facebook. Password reset, email verification, and linking several sign-in methods to one account.
- **Membership (SleepCode+):** one paid tier, $7/month or $49/year, sold on this site with Stripe Checkout. Members manage billing in the Stripe Customer Portal.
- **Free and members-only sessions:** sessions flagged `free` in `src/data/sessions.json` are open to every signed-in user. All others need a membership. The server enforces this when it signs audio URLs.
- **Account page:** membership status, profile, sign-in methods, password, and account deletion.
- **Player:** `/application` (Home) lists the sessions. Each session is a folder of short statement clips plus a pulse track, loaded into memory and played in lockstep on a loop, with a voice/pulse blend, repeat count (1x/2x/4x), session timer, and Night Shade.

## Design system

The visual design comes from the design handoff (`../handoff/`). Tokens and shared patterns (colors, Space Grotesk / Space Mono, hairline rows, the single `--signal` accent, tab bar / side-nav, bottom sheet) live in `src/app/globals.css` and are exposed to Tailwind in `tailwind.config.ts` (`bg-bg`, `text-fg-muted`, `border-line`, the `wide:` 900px breakpoint, and so on). Check new UI against the handoff README's "Hard rules" before shipping.

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Firebase Auth and Firestore (client SDK and Admin SDK)
- Stripe (Checkout, Customer Portal, webhooks)
- AWS SES for the contact form
- Session audio in a private S3 bucket (`slpcd-media`) served through CloudFront signed URLs

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
│   │   ├── media/session/       # Signs CloudFront access to one session's audio folder
│   │   └── ...                  # contact, auth proxy
│   ├── (site)/                  # Marketing, pricing, and legal pages (shared header and footer)
│   ├── account/                 # Account page
│   ├── application/             # Home (session list) and the player
│   └── login/                   # Sign in, sign up, password reset
├── components/
│   ├── account/                 # Account page sections and the re-sign-in sheet
│   ├── site/                    # Marketing header, footer, article layout, breathing rings
│   └── ui/                      # App shell, back header, bottom sheet, icons
├── contexts/AuthContext.tsx     # Auth state and sign-in actions
├── hooks/useMembership.ts       # Live membership status
└── lib/
    ├── firebase.ts              # Client Firebase
    ├── firebaseAdmin.ts         # Admin Firebase and requireUser()
    ├── stripe.ts                # Stripe client and membership sync
    ├── membership.ts            # Prices and shared membership types
    ├── catalog.ts               # Session catalog (from src/data/sessions.json) and lock rules
    ├── cloudfront.ts            # Signs wildcard CloudFront URL policies
    ├── playerPrefs.ts           # Blend, repeat, and timer preferences
    ├── audio/                   # Clip engine (Web Audio), play order, stay-awake
    ├── authProviders.ts         # Social provider setup and account linking
    └── authErrors.ts            # Friendly auth error messages
```

## Deployment

Deploys on Vercel. Add every environment variable from [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md), point the Stripe webhook at `https://<your-domain>/api/billing/webhook`, and deploy `firestore.rules`.

## Support

Email contact@sleepcoding.me.
