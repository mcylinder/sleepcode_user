'use client';

import { usePathname } from 'next/navigation';

// Faint concentric rings radiating from the top-right corner, fading out down the page.
// Skipped on the home page, where the hero rings already carry the motif.
export default function RingField() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <svg
      aria-hidden="true"
      className="sc-ringfield pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] w-full"
      viewBox="0 0 1440 560"
      preserveAspectRatio="xMidYMin slice"
    >
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={`a${i}`}
          cx="1260"
          cy="-40"
          r={(i + 1) * 46}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          opacity={(0.15 - (i + 1) * 0.009).toFixed(3)}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <circle
          key={`b${i}`}
          cx="80"
          cy="520"
          r={(i + 1) * 40}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
          opacity={(0.08 - (i + 1) * 0.008).toFixed(3)}
        />
      ))}
    </svg>
  );
}
