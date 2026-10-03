import Link from 'next/link';

// The wordmark: an accent ring plus "SleepCode".
export default function Logo({ href = '/', compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-[9px] font-semibold tracking-[-0.01em] text-ink ${compact ? 'text-[17px]' : 'text-[18px]'}`}
    >
      <span
        aria-hidden="true"
        className={`box-border rounded-full border-2 border-accent ${compact ? 'h-[13px] w-[13px]' : 'h-[14px] w-[14px]'}`}
      />
      SleepCode
    </Link>
  );
}
