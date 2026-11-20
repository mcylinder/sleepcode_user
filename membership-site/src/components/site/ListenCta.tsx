'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import HeroCta from './HeroCta';

// The closing panel on How to listen. SleepCode+ members get library wording, not "free".
export default function ListenCta() {
  const { currentUser } = useAuth();
  const { isMember } = useMembership();
  const member = !!currentUser && isMember;

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-surface p-[clamp(22px,3vw,32px)]">
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-semibold leading-[1.3] tracking-[-0.01em]">Ready to listen?</h2>
        <p className="text-[16px] leading-[1.6] text-ink-muted">
          {member
            ? 'Pick up where you left off, or choose a new goal in the library.'
            : 'Try Fresh Start free, or browse every goal in the library.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <HeroCta size="md" />
        <Link href="/library" className="text-[15px] font-medium text-ink underline-offset-4 hover:underline">
          Explore the library
        </Link>
      </div>
    </div>
  );
}
