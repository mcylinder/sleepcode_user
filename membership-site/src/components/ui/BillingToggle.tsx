import { YEARLY_SAVINGS_PERCENT, type BillingInterval } from '@/lib/membership';

const OPTIONS: { id: BillingInterval; label: string }[] = [
  { id: 'month', label: 'Monthly' },
  { id: 'year', label: 'Yearly' },
];

export default function BillingToggle({
  value,
  onChange,
}: {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
}) {
  return (
    <div className="sc-seg" role="radiogroup" aria-label="Billing period">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.id === 'year' && (
            <span className="ml-[6px] text-[11px] font-semibold text-accent">Save {YEARLY_SAVINGS_PERCENT}%</span>
          )}
        </button>
      ))}
    </div>
  );
}
