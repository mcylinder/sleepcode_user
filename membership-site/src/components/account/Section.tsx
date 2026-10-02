import { ChevronRight } from '@/components/ui/icons';

export function AccountSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-[30px] wide:mt-[34px]">
      <div className="sc-eyebrow mb-1">{title}</div>
      {children}
    </section>
  );
}

// A settings row that opens in place, keeping the hairline-row layout instead of modal cards.
export function ExpandableRow({
  label,
  value,
  open,
  onToggle,
  children,
}: {
  label: string;
  value?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left wide:py-[15px]"
      >
        <span className="text-[15px] font-medium wide:text-[14px]">{label}</span>
        <span className="flex items-center gap-[6px]">
          {value && <span className="text-[13px] text-fg-muted">{value}</span>}
          <ChevronRight className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`} />
        </span>
      </button>
      {open && <div className="flex flex-col gap-4 pb-6">{children}</div>}
    </div>
  );
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}
