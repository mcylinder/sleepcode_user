export type Status = { type: 'error' | 'success'; text: string } | null;

// Feedback stays within the palette: errors read in full --fg, confirmations in --fg-muted.
export default function StatusText({ status, className = '' }: { status: Status; className?: string }) {
  if (!status) return null;
  return (
    <p
      role={status.type === 'error' ? 'alert' : 'status'}
      className={`text-[13px] leading-relaxed ${status.type === 'error' ? 'text-fg' : 'text-fg-muted'} ${className}`}
    >
      {status.type === 'error' && <span aria-hidden="true">! </span>}
      {status.text}
    </p>
  );
}
