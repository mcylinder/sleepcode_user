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
Firebase Console, Project settings, Service accounts, **Generate new private key**. Paste the whole JSON file, ideally on one line. Line breaks inside the private key are tolerated.

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

### Session audio (server, secret)
```
CLOUDFRONT_DOMAIN=d2c4c2fkwcquar.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=K...
CLOUDFRONT_PRIVATE_KEY_BASE64=...
```
Required. `/api/media/session` uses these to sign one CloudFront URL policy per session folder. The key pair ID is the **public key** ID (CloudFront, Key management, Public keys), not the key group ID. For the private key, run `base64 -i cf_private_key.pem` and paste the output.

No longer used, safe to delete: `REVENUECAT_API_KEY`, `NEXT_PUBLIC_HAS_SUBSCRIPTION`, `CHAT_GPT_API_CODE`, `CHAT_GPT_API_MODEL`, `NEXT_PUBLIC_CLOUDFRONT_DOMAIN`, `CLOUDFRONT_PRIVATE_KEY`.

## Stripe dashboard

1. **Product:** Product catalog, Add product, name it "SleepCode+". Add two recurring prices: **$7 per month** and **$49 per year**. Copy each price ID (`price_...`) into `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_YEARLY`.
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

## Session catalog and media

### Catalog
Sessions are listed in `src/data/sessions.json`, in display order. Each entry has:
- `id`: the session's folder name in the media bucket (`session/{id}/`).
- `title`, `theme`, `description`: shown on Home. `theme` also drives the theme filter.
- `free`: `true` for any signed-in user, `false` for SleepCode+ members only. The server checks this before signing.

Changing the catalog means editing the file and deploying.

### Media bucket (S3 `slpcd-media` + CloudFront)
Each session folder holds `manifest.json`, `pulse.m4a`, and the statement clips the manifest lists (`c01_v1.m4a`, `c01_v2.m4a`, ...). The bucket is private. CloudFront reads it through Origin Access Control, and the default behavior requires signed URLs (trusted key group).

CORS comes from a CloudFront Function (`slpcd-cors`, runtime `cloudfront-js-2.0`) attached to the default behavior's **Viewer response** event:

```js
function handler(event) {
  var response = event.response;
  response.headers['access-control-allow-origin'] = { value: '*' };
  return response;
}
```

The managed response headers policies aren't enough on their own: Chrome sends a `Priority` header on `fetch`, and CloudFront then omits `Access-Control-Allow-Origin`, so the browser blocks the audio. Custom response headers policies would fix that but aren't available on the flat-rate Free plan.
