'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { PRICES } from '@/lib/membership';
import {
  SESSIONS,
  THEMES,
  findSession,
  isLocked,
  loadLastSession,
  playerHref,
  type Session,
} from '@/lib/catalog';
import AppShell from '@/components/ui/AppShell';
import Sheet from '@/components/ui/Sheet';
import { LockIcon, UserIcon } from '@/components/ui/icons';

const ALL = 'All';

function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { currentUser } = useAuth();
  const { isMember, loading: membershipLoading } = useMembership();
  const router = useRouter();
  const [greeting, setGreeting] = useState('Good evening');
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [lockedSession, setLockedSession] = useState<Session | null>(null);
  const [theme, setTheme] = useState(ALL);

  useEffect(() => {
    if (!currentUser) router.replace('/login?next=/application');
  }, [currentUser, router]);

  useEffect(() => {
    if (!currentUser) return;
    setGreeting(greetingFor(new Date().getHours()));
    setLastSession(loadLastSession());

    // Sent here by the player's membership gate.
    const locked = findSession(new URLSearchParams(window.location.search).get('locked'));
    if (locked) {
      setLockedSession(locked);
      window.history.replaceState(null, '', '/application');
    }
  }, [currentUser]);

  const locked = (session: Session) => !membershipLoading && isLocked(session, isMember);
  const visible = theme === ALL ? SESSIONS : SESSIONS.filter((session) => session.theme === theme);

  function openSession(session: Session) {
    if (membershipLoading && !session.free) return;
    if (isLocked(session, isMember)) {
      setLockedSession(session);
      return;
    }
    router.push(playerHref(session));
  }

  if (!currentUser) return null;

  return (
    <AppShell
      active="home"
      topbar={
        <div className="flex items-center justify-between">
          <Link href="/account" aria-label="Account" className="-m-1 p-1">
            <UserIcon />
          </Link>
          <div className="sc-eyebrow--muted">SleepCode</div>
          <span className="w-[15px]" aria-hidden="true" />
        </div>
      }
    >
      <div className="wide:max-w-[720px]">
        <div>
          <div className="sc-eyebrow--muted">{greeting}</div>
          <h1 className="mt-[6px] text-[22px] font-semibold wide:text-[26px]">Ready to wind down?</h1>
        </div>

        {lastSession && !locked(lastSession) && (
          <button
            onClick={() => openSession(lastSession)}
            className="block w-full pt-[26px] text-left wide:mt-5 wide:pt-7"
          >
            <div className="border-b border-line pb-4">
              <div className="sc-eyebrow">Continue &middot; Tonight</div>
              <div className="mt-[5px] text-[17px] font-semibold wide:text-[18px]">{lastSession.title}</div>
            </div>
          </button>
        )}

        {THEMES.length > 1 && (
          <div className="relative mt-6 wide:mt-[30px]">
            <div className="sc-eyebrow mb-3">Browse by Theme</div>
            <div className="relative">
              <div className="sc-no-scrollbar flex gap-4 overflow-x-auto text-[13px] wide:flex-wrap wide:gap-x-[22px] wide:gap-y-[10px] wide:overflow-visible">
                {[ALL, ...THEMES].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTheme(item)}
                    aria-pressed={theme === item}
                    className={`flex-shrink-0 whitespace-nowrap ${theme === item ? 'font-semibold text-fg' : 'text-fg-faint hover:text-fg-muted'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="sc-fade-right wide:hidden" />
            </div>
          </div>
        )}

        <div className="mt-[30px] wide:mt-[34px]">
          <div className="sc-eyebrow mb-1">{theme === ALL ? 'All Sessions' : theme}</div>
          {visible.length === 0 ? (
            <p className="py-4 text-[13px] text-fg-faint">No sessions yet.</p>
          ) : (
            <div className="flex flex-col wide:grid wide:grid-cols-2 wide:gap-x-10">
              {visible.map((session, i) => {
                const isRowLocked = locked(session);
                return (
                  <button
                    key={session.id}
                    onClick={() => openSession(session)}
                    aria-label={isRowLocked ? `${session.title}, part of SleepCode+` : session.title}
                    className={`sc-row flex w-full items-center justify-between gap-4 text-left ${
                      i === visible.length - 1 ? 'sc-row--last' : ''
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="sc-eyebrow--muted block text-[10px]">{session.theme}</span>
                      <span className={`mt-[3px] block text-[15px] font-medium ${isRowLocked ? 'text-fg-faint' : 'text-fg'}`}>
                        {session.title}
                      </span>
                    </span>
                    {isRowLocked && <LockIcon />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!lockedSession} onClose={() => setLockedSession(null)} label="SleepCode+">
        {lockedSession && (
          <>
            <div className="text-center">
              <div className="sc-eyebrow--muted">SleepCode+</div>
              <div className="mt-2 text-[19px] font-semibold">{lockedSession.title}</div>
              <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-fg-muted">
                This session is part of SleepCode+. Membership unlocks every session for {PRICES.month.amount}{' '}
                {PRICES.month.label} or {PRICES.year.amount} {PRICES.year.label}.
              </p>
            </div>
            <Link href="/pricing" className="sc-cta-filled">See SleepCode+</Link>
            <button onClick={() => setLockedSession(null)} className="sc-textbtn sc-textbtn--muted -mt-2 self-center">
              Not now
            </button>
          </>
        )}
      </Sheet>
    </AppShell>
  );
}
