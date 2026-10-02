export type BillingInterval = 'month' | 'year';

export interface Membership {
  status: string;
  interval: BillingInterval | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  subscriptionId: string | null;
}

export const PRICES: Record<BillingInterval, { amount: string; label: string }> = {
  month: { amount: '$7', label: 'per month' },
  year: { amount: '$49', label: 'per year' },
};

export function isActiveStatus(status: unknown): boolean {
  return status === 'active' || status === 'trialing';
}
