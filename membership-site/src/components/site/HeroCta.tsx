'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FEATURED_FREE_SESSION, loadLastPlayed, needsMembership, playedAgo, playerHref, type LastPlayed } from '@/lib/catalog';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import PlayLink from '@/components/ui/PlayLink';
import { useDissolve } from '@/components/ui/Dissolve';

// The main call to action, tailored to who's looking:
// - Signed out: try the free session (sign-up first).
// - Signed in: continue the last session they can play, otherwise start Fresh Start
//   (SleepCode plan) or open the library (SleepCode+).
export default function HeroCta({ size = 'lg' }: { size?: 'lg' | 'md' }) {
  const dissolveTo = useDissolve();
  const { currentUser } = useAuth();
  const { isMember, loading } = useMembership();
  const [lastPlayed, setLastPlayed] = useState<LastPlayed | null>(null);
  const free = FEATURED_FREE_SESSION;
  const btn = size === 'lg' ? 'sc-btn sc-btn--lg' : 'sc-btn';

  useEffect(() => {
    setLastPlayed(loadLastPlayed());
  }, []);

  // Hold the space while membership loads, so the button doesn't swap in front of the visitor.
  if (currentUser && loading) return <span className={`${btn} invisible`} aria-hidden="true">Loading</span>;

  const resume =
    currentUser && lastPlayed && (isMember || !needsMembership(lastPlayed.session)) ? lastPlayed : null;

  if (resume) {
    const href = playerHref(resume.session);
    return (
      <div className="flex flex-wrap items-center gap-[18px]">
        <a
          href={href}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            dissolveTo(href);
          }}
          className={btn}
        >
          Continue {resume.session.title}
        </a>
        {resume.playedAt && (
          <span className="text-[14px] text-ink-muted">Last played {playedAgo(resume.playedAt)}</span>
        )}
      </div>
    );
  }

  if (currentUser && isMember) {
    return (
      <Link href="/library" className={`${btn} self-start`}>
        Open the library
      </Link>
    );
  }

  if (!free) return null;
  return (
    <PlayLink session={free} className={`${btn} self-start`}>
      {currentUser ? `Play ${free.title}` : 'Try a free session'}
    </PlayLink>
  );
}
