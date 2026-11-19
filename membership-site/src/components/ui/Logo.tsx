import Link from 'next/link';

// The wordmark: the player's rings in miniature (two rings and a centre dot) plus "SleepCode".
export default function Logo({ href = '/', compact = false }: { href?: string; compact?: boolean }) {
  const size = compact ? 19 : 21;
  return (
    <Link
      href={href}
      className={`flex items-center gap-[9px] font-semibold tracking-[-0.01em] text-ink ${compact ? 'text-[17px]' : 'text-[18px]'}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="flex-none text-accent" aria-hidden="true">
        <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.1" fill="currentColor" />
      </svg>
      SleepCode
    </Link>
  );
}
