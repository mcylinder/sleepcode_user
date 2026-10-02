import Stripe from 'stripe';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin';
import { isActiveStatus, type BillingInterval } from './membership';

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
    client = new Stripe(key);
  }
  return client;
}

export function priceIdFor(interval: BillingInterval): string {
  const priceId = interval === 'year' ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
  if (!priceId) {
    throw new Error(`Missing required environment variable: ${interval === 'year' ? 'STRIPE_PRICE_YEARLY' : 'STRIPE_PRICE_MONTHLY'}`);
  }
  return priceId;
}

export function siteUrl(fallbackOrigin: string): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || fallbackOrigin).replace(/\/$/, '');
}

function userRef(uid: string) {
  return adminDb().collection('users').doc(uid);
}

export async function getOrCreateCustomer(uid: string, email: string | null): Promise<string> {
  const snap = await userRef(uid).get();
  const existing = snap.get('stripeCustomerId') as string | undefined;
  if (existing) return existing;

  const customer = await stripe().customers.create(
    { email: email ?? undefined, metadata: { firebaseUid: uid } },
    { idempotencyKey: `create-customer-${uid}` },
  );
  await userRef(uid).set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

export async function getStripeCustomerId(uid: string): Promise<string | null> {
  const snap = await userRef(uid).get();
  return (snap.get('stripeCustomerId') as string | undefined) ?? null;
}

async function uidForCustomer(customerId: string): Promise<string | null> {
  const customer = await stripe().customers.retrieve(customerId);
  if (!customer.deleted && customer.metadata?.firebaseUid) {
    return customer.metadata.firebaseUid;
  }
  const match = await adminDb().collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
  return match.empty ? null : match.docs[0].id;
}

const STATUS_PRIORITY: Stripe.Subscription.Status[] = [
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'incomplete',
  'paused',
  'canceled',
  'incomplete_expired',
];

function pickSubscription(subscriptions: Stripe.Subscription[]): Stripe.Subscription | null {
  if (!subscriptions.length) return null;
  return [...subscriptions].sort((a, b) => {
    const byStatus = STATUS_PRIORITY.indexOf(a.status) - STATUS_PRIORITY.indexOf(b.status);
    return byStatus !== 0 ? byStatus : b.created - a.created;
  })[0];
}

// Re-reads every subscription for the customer so webhook ordering and duplicate
// subscriptions can never leave a stale status on the user document.
export async function syncCustomerMembership(customerId: string): Promise<void> {
  const uid = await uidForCustomer(customerId);
  if (!uid) {
    console.warn(`Stripe customer ${customerId} has no matching Firebase user`);
    return;
  }

  const ref = userRef(uid);
  if (!(await ref.get()).exists) return;

  const { data } = await stripe().subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
  const subscription = pickSubscription(data);

  if (!subscription) {
    await ref.set(
      {
        stripeCustomerId: customerId,
        membership: {
          status: 'none',
          interval: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          subscriptionId: null,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    );
    return;
  }

  const item = subscription.items.data[0];
  const periodEnd = subscription.cancel_at ?? item?.current_period_end ?? null;
  const interval = item?.price.recurring?.interval;

  await ref.set(
    {
      stripeCustomerId: customerId,
      membership: {
        status: subscription.status,
        interval: interval === 'month' || interval === 'year' ? interval : null,
        currentPeriodEnd: periodEnd ? Timestamp.fromMillis(periodEnd * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || subscription.cancel_at !== null,
        subscriptionId: subscription.id,
        updatedAt: FieldValue.serverTimestamp(),
      },
    },
    { merge: true },
  );
}

export async function isMemberOnServer(uid: string): Promise<boolean> {
  const snap = await userRef(uid).get();
  return isActiveStatus(snap.get('membership.status'));
}

export async function cancelAllSubscriptions(customerId: string): Promise<void> {
  const { data } = await stripe().subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
  await Promise.all(
    data
      .filter((subscription) => !['canceled', 'incomplete_expired'].includes(subscription.status))
      .map((subscription) => stripe().subscriptions.cancel(subscription.id)),
  );
}
