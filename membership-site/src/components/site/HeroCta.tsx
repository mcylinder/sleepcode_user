'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { FEATURED_FREE_SESSION, isLocked, loadLastPlayed, playedAgo, playerHref, type LastPlayed } from '@/lib/catalog';
import PlayLink from '@/components/ui/PlayLink';
import { useDissolve } from '@/components/ui/Dissolve';

// Landing hero button. Signed-out visitors get the free session; signed-in listeners pick up
// where they left off, or go to their library.
export default function HeroCta() {
  const { currentUser } = useAuth();
  const { isMember, loading: membershipLoading } = useMembership();
  const dissolveTo = useDissolve();
  const [lastPlayed, setLastPlayed] = useState<LastPlayed | null>(null);
  const free = FEATURED_FREE_SESSION;

  useEffect(() => {
    setLastPlayed(currentUser ? loadLastPlayed() : null);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-wrap items-center gap-[18px]">
        {free ? (
          <PlayLink session={free} className="sc-btn sc-btn--lg">
            Play {free.title}, free
          </PlayLink>
        ) : (
          <Link href="/login?mode=signup" className="sc-btn sc-btn--lg">Create a free account</Link>
        )}
        <span className="text-[14px] text-ink-muted">Our most-played session</span>
      </div>
    );
  }

  const resume = lastPlayed && !membershipLoading && !isLocked(lastPlayed.session, isMember) ? lastPlayed : null;

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
          className="sc-btn sc-btn--lg"
        >
          Continue {resume.session.title}
        </a>
        {resume.playedAt && (
          <span className="text-[14px] text-ink-muted">Last played {playedAgo(resume.playedAt)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-[18px]">
      <Link href="/application" className="sc-btn sc-btn--lg">Open your library</Link>
    </div>
  );
}
