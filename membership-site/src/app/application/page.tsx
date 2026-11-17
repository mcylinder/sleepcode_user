'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  SESSIONS,
  THEMES,
  loadLastPlayed,
  needsMembership,
  playedAgo,
  playerHref,
  scriptHref,
  sessionLabel,
  type LastPlayed,
  type Session,
} from '@/lib/catalog';
import AppShell from '@/components/ui/AppShell';
import { useDissolve } from '@/components/ui/Dissolve';
import { PlayIcon } from '@/components/ui/icons';
import { useMembership } from '@/hooks/useMembership';

const ALL = 'All';

function LibraryBody() {
  const dissolveTo = useDissolve();
  const searchParams = useSearchParams();
  const { isMember, loading: membershipLoading } = useMembership();
  const [lastPlayed, setLastPlayed] = useState<LastPlayed | null>(null);
  const themeParam = searchParams.get('theme');
  const initialTheme = themeParam && THEMES.includes(themeParam) ? themeParam : ALL;
  const [theme, setTheme] = useState(initialTheme);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLastPlayed(loadLastPlayed());
  }, []);

  useEffect(() => {
    if (themeParam && THEMES.includes(themeParam)) setTheme(themeParam);
  }, [themeParam]);

  const needle = query.trim().toLowerCase();
  const visible = SESSIONS.filter((session) => {
    if (theme !== ALL && session.theme !== theme) return false;
    if (!needle) return true;
    const haystack = [session.title, session.theme, session.description, sessionLabel(session)]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });

  function canPlay(session: Session) {
    return session.free || isMember;
  }

  const continueSession =
    lastPlayed && canPlay(lastPlayed.session) ? lastPlayed : null;

  function openSession(session: Session) {
    if (!canPlay(session)) return;
    dissolveTo(playerHref(session));
  }

  return (
    <AppShell active="library">
      <div className="flex flex-col gap-[34px]">
        <h1 className="sc-h-app">What are you working on?</h1>

        {continueSession && (
          <div className="flex flex-col gap-3">
            <span className="sc-eyebrow">Continue</span>
            <button
              type="button"
              onClick={() => openSession(continueSession.session)}
              className="flex items-center gap-4 border-y border-[rgba(44,38,32,0.16)] py-4 text-left"
            >
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-accent text-on-accent">
                <PlayIcon size={13} className="translate-x-[1px]" />
              </span>
              <span className="flex flex-1 flex-col gap-[3px]">
                <span className="text-[17px] font-semibold">{sessionLabel(continueSession.session)}</span>
                <span className="text-[14px] text-ink-muted">
                  {continueSession.playedAt && `Last played ${playedAgo(continueSession.playedAt)}`}
                </span>
              </span>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-[34px]">
          <label className="flex flex-col gap-2">
            <span className="sr-only">Search sessions</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions"
              className="min-h-[44px] w-full max-w-[420px] rounded-full border border-hairline-strong bg-bg px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted focus:border-accent"
            />
          </label>

          <div className="sc-scroll-fade sc-no-scrollbar -mb-2 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by goal">
            {[ALL, ...THEMES].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTheme(item)}
                aria-pressed={theme === item}
                className={`sc-pill ${theme === item ? 'is-selected' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-col">
            {visible.length === 0 && (
              <p className="border-t border-hairline py-[18px] text-[15px] text-ink-muted">
                No sessions match that search.
              </p>
            )}
            {visible.map((session, i) => {
              const locked = needsMembership(session) && !isMember && !membershipLoading;
              return (
                <div
                  key={session.id}
                  className="grid grid-cols-[30px_1fr] items-start gap-[14px] border-t border-hairline py-[15px]"
                  style={{ opacity: locked ? 0.72 : 1 }}
                >
                  <span className="pt-[4px] font-mono text-[12px] text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex min-w-0 flex-col gap-[6px]">
                    {locked ? (
                      <span className="text-[16px] font-semibold">{sessionLabel(session)}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openSession(session)}
                        className="text-left text-[16px] font-semibold"
                      >
                        {sessionLabel(session)}
                      </button>
                    )}
                    {session.description ? (
                      <span className="line-clamp-2 max-w-[60ch] text-[14px] leading-[1.5] text-ink-body">
                        {session.description}
                      </span>
                    ) : null}
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
                      {session.free ? (
                        <span>Free</span>
                      ) : locked ? (
                        <Link href="/pricing" className="sc-link">
                          SleepCode+
                        </Link>
                      ) : (
                        <span>SleepCode+</span>
                      )}
                      {(session.free || isMember) && (
                        <Link href={scriptHref(session)} className="sc-link">
                          Read the transcript
                        </Link>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <LibraryBody />
    </Suspense>
  );
}
