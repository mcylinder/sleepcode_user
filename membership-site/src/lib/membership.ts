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
export const YEARLY_SAVINGS_PERCENT = Math.round((1 - YEARLY / (MONTHLY * 12)) * 100);

export const PRICES: Record<BillingInterval, { amount: string; label: string; note: string }> = {
  month: { amount: `$${MONTHLY}`, label: 'a month', note: 'Billed monthly.' },
  year: {
    amount: `$${YEARLY}`,
    label: 'a year',
    note: `About $${Math.round(YEARLY / 12)} a month, billed yearly.`,
  },
};

export function isActiveStatus(status: unknown): boolean {
  return status === 'active' || status === 'trialing';
}
