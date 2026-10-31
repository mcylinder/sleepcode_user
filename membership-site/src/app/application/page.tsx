'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  SESSIONS,
  THEMES,
  isComingSoon,
  loadLastPlayed,
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

const ALL = 'All';
const PLAYABLE_COUNT = SESSIONS.filter((session) => !isComingSoon(session)).length;

export default function HomePage() {
  const dissolveTo = useDissolve();
  const [lastPlayed, setLastPlayed] = useState<LastPlayed | null>(null);
  const [theme, setTheme] = useState(ALL);

  useEffect(() => {
    setLastPlayed(loadLastPlayed());
  }, []);

  const visible = theme === ALL ? SESSIONS : SESSIONS.filter((session) => session.theme === theme);
  const continueSession = lastPlayed && lastPlayed.session.free ? lastPlayed : null;

  function openSession(session: Session) {
    if (isComingSoon(session)) return;
    dissolveTo(playerHref(session));
  }

  return (
    <AppShell active="library">
      <div className="flex flex-col gap-[34px]">
        <h1 className="sc-h-app">What are you working on?</h1>

        {PLAYABLE_COUNT >= 2 && continueSession && (
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
          {PLAYABLE_COUNT >= 2 && (
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
          )}

          <div className="flex flex-col">
            {visible.map((session, i) => {
              const soon = isComingSoon(session);
              return (
                <div
                  key={session.id}
                  className="grid grid-cols-[30px_1fr] items-start gap-[14px] border-t border-hairline py-[15px]"
                  style={{ opacity: soon ? 0.62 : 1 }}
                >
                  <span className="pt-[4px] font-mono text-[12px] text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex min-w-0 flex-col gap-[6px]">
                    {soon ? (
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
                      <span>{soon ? 'Coming soon' : 'Free'}</span>
                      {!soon && (
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
