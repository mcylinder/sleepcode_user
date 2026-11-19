'use client';

import { useEffect, useState } from 'react';
import { FEATURED_FREE_SESSION, loadLastPlayed, playedAgo, playerHref, type LastPlayed } from '@/lib/catalog';
import PlayLink from '@/components/ui/PlayLink';
import { useDissolve } from '@/components/ui/Dissolve';

// Landing hero button. Signed-out visitors sign up free, then land in the player.
export default function HeroCta() {
  const dissolveTo = useDissolve();
  const [lastPlayed, setLastPlayed] = useState<LastPlayed | null>(null);
  const free = FEATURED_FREE_SESSION;

  useEffect(() => {
    setLastPlayed(loadLastPlayed());
  }, []);


  const resume = lastPlayed?.session.free ? lastPlayed : null;

  if (resume) {
    const href = playerHref(resume.session);
    return (
      <div className="flex flex-col gap-3">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {free ? (
        <PlayLink session={free} className="sc-btn sc-btn--lg self-start">
          Try a free session
        </PlayLink>
      ) : null}
    </div>
  );
}
