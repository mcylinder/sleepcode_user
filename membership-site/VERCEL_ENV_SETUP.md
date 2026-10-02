# Environment and Service Setup

Set every variable below in `.env.local` for local development and in Vercel (Project Settings, Environment Variables) for production. Use Stripe **test** keys locally and in Preview, and **live** keys in Production.

## Environment variables

### Firebase (client, safe to expose)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sleepcodingbase.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sleepcodingbase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sleepcodingbase.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=2186950665
NEXT_PUBLIC_FIREBASE_APP_ID=1:2186950665:web:87ab81aa19f8cc17f120d8
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6J693D0VCT
```

### Firebase Admin (server, secret)
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"sleepcodingbase",...}
```
Firebase Console, Project settings, Service accounts, **Generate new private key**. Paste the whole JSON file on one line.

### Stripe (server, secret)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
NEXT_PUBLIC_SITE_URL=https://sleepcoding.me
```
`NEXT_PUBLIC_SITE_URL` is where Stripe sends people back after checkout and the billing portal. Use `http://localhost:3000` locally.

### Email (server, secret)
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
SES_FROM_EMAIL=...
SES_TO_EMAIL=...
```

### Player audio
```
CLOUDFRONT_DOMAIN=...
NEXT_PUBLIC_CLOUDFRONT_DOMAIN=...
```
Optional. Without them the player loads audio directly from S3.

No longer used, safe to delete: `REVENUECAT_API_KEY`, `NEXT_PUBLIC_HAS_SUBSCRIPTION`, `CHAT_GPT_API_CODE`, `CHAT_GPT_API_MODEL`, `CLOUDFRONT_KEY_PAIR_ID`, `CLOUDFRONT_PRIVATE_KEY`.

## Stripe dashboard

1. **Product:** Product catalog, Add product, name it "SleepCoding Membership". Add two recurring prices: **$7 per month** and **$49 per year**. Copy each price ID (`price_...`) into `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_YEARLY`.
2. **Customer portal:** Settings, Billing, Customer portal. Turn on:
   - Customers can update payment methods
   - Customers can view invoice history
   - Customers can cancel subscriptions (choose "At end of billing period")
   - Customers can switch plans, and add both membership prices to the product list
3. **Webhook:** Developers, Webhooks, Add endpoint:
   - URL: `https://sleepcoding.me/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Repeat steps 1 to 3 in both test mode and live mode. Test-mode and live-mode IDs are different.

### Testing webhooks locally
```bash
stripe login
stripe listen --forward-to localhost:3000/api/billing/webhook
```
`stripe listen` prints a `whsec_...` secret. Put it in `.env.local` as `STRIPE_WEBHOOK_SECRET` while testing. Use card `4242 4242 4242 4242` with any future date and CVC.

## Firebase Console

### Sign-in providers
Authentication, Sign-in method: enable **Email/Password**, **Google**, **Facebook**, and **Apple**. Keep the default "One account per email address" setting so the site can link providers that share an email.

Authentication, Settings, Authorized domains: add your production domain and any Vercel preview domain you test on.

### Firestore rules
Deploy the rules in `firestore.rules`. They let users read their own record and edit only their profile fields. Membership and Stripe fields can only be written by the server.
```bash
firebase deploy --only firestore:rules
```

### Apple Sign-In
1. Firebase Console, Authentication, Sign-in method: enable Apple, and add your Apple Developer Team ID, Service ID (`sleepcoding.web.auth`), key ID, and private key.
2. Apple Developer Console, Certificates, Identifiers & Profiles: select the Service ID, enable "Sign In with Apple", and add return URLs:
   - `https://sleepcodingbase.firebaseapp.com/__/auth/handler`
   - `https://your-domain/__/auth/handler`

### Facebook Login
In the Meta for Developers app, add the OAuth redirect URI shown in the Firebase Facebook provider settings, and copy the Meta app ID and secret into Firebase.

## Catalog: marking free sessions
In the app.sleepcoding.me admin, give each instruction a `free` field (`1` for free, `0` or empty for members-only) and set it on the one or two free sessions. `/api/sessions` passes it through. Sessions without the field are treated as members-only.
