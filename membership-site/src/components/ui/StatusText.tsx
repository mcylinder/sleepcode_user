export type Status = { type: 'error' | 'success'; text: string } | null;

// Errors get a tinted callout so they can't be missed; confirmations stay quiet in --ink-muted.
export default function StatusText({ status, className = '' }: { status: Status; className?: string }) {
  if (!status) return null;
  if (status.type === 'error') {
    return (
      <p role="alert" className={`sc-alert ${className}`}>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-[2px] h-[18px] w-[18px] shrink-0" fill="none">
          <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 5.75v5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="10" cy="14.25" r="1.1" fill="currentColor" />
        </svg>
        <span>{status.text}</span>
      </p>
    );
  }
  return (
    <p role="status" className={`text-[15px] leading-[1.6] text-ink-muted ${className}`}>
      {status.text}
    </p>
  );
}
