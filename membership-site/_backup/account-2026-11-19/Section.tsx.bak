import { ChevronRight } from '@/components/ui/icons';

export function AccountSection({
  title,
  accent = false,
  children,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col">
      <span className={`sc-eyebrow pb-[10px] ${accent ? '' : 'sc-eyebrow--muted'}`}>{title}</span>
      {children}
    </section>
  );
}

// A settings row that opens in place. The right side shows a mono value and a chevron, or a
// text action such as "Edit".
export function ExpandableRow({
  label,
  value,
  action,
  quiet = false,
  open,
  onToggle,
  children,
}: {
  label: React.ReactNode;
  value?: string;
  action?: string;
  quiet?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={quiet ? '' : 'border-t border-hairline'}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 text-left ${
          quiet ? 'min-h-[44px] text-[14px] text-ink-muted' : 'py-4 text-[16px]'
        }`}
      >
        <span className="min-w-0 truncate">{label}</span>
        {action ? (
          <span className="flex-none font-semibold underline underline-offset-4">{open ? 'Close' : action}</span>
        ) : (
          !quiet && (
            <span className="flex flex-none items-center gap-[10px] text-ink-muted">
              {value && (
                <span className={/^[\d\s\u00d7/:%]+$/.test(value) ? 'font-mono text-[13px]' : 'text-[14px]'}>{value}</span>
              )}
              <ChevronRight className={`transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
            </span>
          )
        )}
      </button>
      {open && <div className="flex flex-col gap-4 pb-6 pt-1">{children}</div>}
    </div>
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}
