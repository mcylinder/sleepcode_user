export type BillingInterval = 'month' | 'year';

export interface Membership {
  status: string;
  interval: BillingInterval | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  subscriptionId: string | null;
}

const MONTHLY = 7;
const YEARLY = 49;
const YEARLY_SAVINGS_PERCENT = Math.round((1 - YEARLY / (MONTHLY * 12)) * 100);

export const PRICES: Record<BillingInterval, { amount: string; label: string; note: string }> = {
  month: { amount: `$${MONTHLY}`, label: 'a month', note: 'Billed monthly.' },
  year: {
    amount: `$${YEARLY}`,
    label: 'a year',
    note: `That is about $${Math.round(YEARLY / 12)} a month, ${YEARLY_SAVINGS_PERCENT}% less than paying monthly.`,
  },
};

export function isActiveStatus(status: unknown): boolean {
  return status === 'active' || status === 'trialing';
}
