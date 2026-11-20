'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SESSIONS, THEMES, loadLastPlayed, playerHref, type Session } from '@/lib/catalog';
import SessionName from '@/components/ui/SessionName';
import { PlayIcon } from '@/components/ui/icons';

const COUNT = 6;

// One session from each of several goals, skipping the goal they're already on.
// The picks change once a day, so the home page has something new without being random on every visit.
function pick(lastTheme: string | null, day: number): Session[] {
  const themes = THEMES.filter((t) => t !== lastTheme);
  const picks: Session[] = [];
  for (let i = 0; i < themes.length && picks.length < COUNT; i++) {
    const theme = themes[(i + day) % themes.length];
    // Only the first part of a series, so each pick starts at the beginning.
    const pool = SESSIONS.filter((s) => s.theme === theme && !/-part-(?!1$)\d+$/.test(s.id));
    if (pool.length) picks.push(pool[(day * 7 + i * 3) % pool.length]);
  }
  return picks;
}

export default function MemberPicks() {
  const [picks, setPicks] = useState<Session[]>([]);

  useEffect(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    setPicks(pick(loadLastPlayed()?.session.theme ?? null, day));
  }, []);

  if (!picks.length) return null;

  return (
    <section className="sc-band sc-section flex flex-col gap-8">
      <div className="flex max-w-[640px] flex-col gap-[14px]">
        <span className="sc-eyebrow">Try something new</span>
        <h2 className="sc-h-section">A few sessions from other goals.</h2>
      </div>
      <ul className="grid grid-cols-1 gap-x-10 border-b border-hairline sm:grid-cols-2">
        {picks.map((session) => (
          <li key={session.id} className="border-t border-hairline">
            <Link
              href={playerHref(session)}
              className="group flex items-center gap-4 py-[15px] transition-colors hover:bg-[var(--hover-wash)]"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="text-[16px] font-semibold">
                  <SessionName session={session} />
                </span>
                {session.description ? (
                  <span className="text-[14px] leading-[1.5] text-ink-body">{session.description}</span>
                ) : null}
              </span>
              <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-accent text-on-accent">
                <PlayIcon size={11} className="translate-x-[1px]" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
