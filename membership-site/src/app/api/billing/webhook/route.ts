import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, syncCustomerMembership } from '@/lib/stripe';

export const runtime = 'nodejs';

function customerIdOf(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!customer) return null;
  return typeof customer === 'string' ? customer : customer.id;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!secret || !signature) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    console.error('Stripe webhook signature check failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let customerId: string | null = null;
  switch (event.type) {
    case 'checkout.session.completed':
      customerId = customerIdOf(event.data.object.customer);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      customerId = customerIdOf(event.data.object.customer);
      break;
    default:
      return NextResponse.json({ received: true });
  }

  if (!customerId) return NextResponse.json({ received: true });

  try {
    await syncCustomerMembership(customerId);
  } catch (error) {
    console.error(`Failed to sync membership for ${customerId} (${event.type}):`, error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
