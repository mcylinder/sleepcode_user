'use client';

import { useState } from 'react';
import { authedFetch } from '@/lib/authedFetch';
import type { BillingInterval } from '@/lib/membership';

// Stripe Checkout and Customer Portal both answer with a URL to send the browser to.
export function useBilling() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function goTo(endpoint: string, body: unknown) {
    try {
      setBusy(true);
      setError('');
      const { url } = await authedFetch<{ url: string }>(endpoint, body);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return {
    busy,
    error,
    startCheckout: (interval: BillingInterval) => goTo('/api/billing/checkout', { interval }),
    openPortal: () => goTo('/api/billing/portal', {}),
  };
}
