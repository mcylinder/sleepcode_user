export type Status = { type: 'error' | 'success'; text: string } | null;

// Feedback stays within the palette: errors read in --ink, confirmations in --ink-muted.
export default function StatusText({ status, className = '' }: { status: Status; className?: string }) {
  if (!status) return null;
  return (
    <p
      role={status.type === 'error' ? 'alert' : 'status'}
      className={`text-[15px] leading-[1.6] ${status.type === 'error' ? 'text-ink' : 'text-ink-muted'} ${className}`}
    >
      {status.type === 'error' && <span aria-hidden="true">! </span>}
      {status.text}
    </p>
  );
}
