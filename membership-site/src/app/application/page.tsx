'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { useBilling } from '@/lib/useBilling';
import { PRICES, type BillingInterval } from '@/lib/membership';
import {
  MEMBER_ONLY_COUNT,
  SESSIONS,
  THEMES,
  findSession,
  isLocked,
  loadLastPlayed,
  moreSessionsLabel,
  playedAgo,
  playerHref,
  type LastPlayed,
  type Session,
} from '@/lib/catalog';
import AppShell from '@/components/ui/AppShell';
import BillingToggle from '@/components/ui/BillingToggle';
import Sheet, { SheetHeader } from '@/components/ui/Sheet';
import StatusText from '@/components/ui/StatusText';
import { useDissolve } from '@/components/ui/Dissolve';
import { LockIcon, PlayIcon } from '@/components/ui/icons';

const ALL = 'All';

export default function HomePage() {
  const { currentUser } = useAuth();
  const { isMember, loading: membershipLoading } = useMembership();
  const router = useRouter();
  const dissolveTo = useDissolve();
  const billing = useBilling();
  const [lastPlayed, setLastPlayed] = useState<LastPlayed | null>(null);
  const [lockedSession, setLockedSession] = useState<Session | null>(null);
  const [interval, setBillingInterval] = useState<BillingInterval>('year');
  const [theme, setTheme] = useState(ALL);

  useEffect(() => {
    if (!currentUser) router.replace('/login?next=/application');
  }, [currentUser, router]);

  useEffect(() => {
    if (!currentUser) return;
    setLastPlayed(loadLastPlayed());

    // Sent here by the player's membership gate.
    const locked = findSession(new URLSearchParams(window.location.search).get('locked'));
    if (locked) {
      setLockedSession(locked);
      window.history.replaceState(null, '', '/application');
    }
  }, [currentUser]);

  const locked = (session: Session) => !membershipLoading && isLocked(session, isMember);
  const visible = theme === ALL ? SESSIONS : SESSIONS.filter((session) => session.theme === theme);
  const continueSession = lastPlayed && !locked(lastPlayed.session) ? lastPlayed : null;

  function openSession(session: Session) {
    if (membershipLoading && !session.free) return;
    if (isLocked(session, isMember)) {
      setLockedSession(session);
      return;
    }
    dissolveTo(playerHref(session));
  }

  if (!currentUser) return null;

  return (
    <AppShell active="application">
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
                <span className="text-[17px] font-semibold">{continueSession.session.title}</span>
                <span className="text-[14px] text-ink-muted">
                  {continueSession.session.theme}
                  {continueSession.playedAt && ` \u00b7 last played ${playedAgo(continueSession.playedAt)}`}
                </span>
              </span>
            </button>
          </div>
        )}

        <div id="sessions" className="flex scroll-mt-6 flex-col gap-[34px]">
          {THEMES.length > 1 && (
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
              const isRowLocked = locked(session);
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => openSession(session)}
                  aria-label={isRowLocked ? `${session.title}, part of SleepCode+` : session.title}
                  className="grid grid-cols-[30px_1fr_18px] items-start gap-[14px] border-t border-hairline py-[15px] text-left"
                  style={{ opacity: isRowLocked ? 0.62 : 1 }}
                >
                  <span className="pt-[4px] font-mono text-[12px] text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span className="text-[16px] font-semibold">{session.title}</span>
                    {session.description && (
                      <span className="line-clamp-2 max-w-[60ch] text-[14px] leading-[1.5] text-ink-body">
                        {session.description}
                      </span>
                    )}
                    <span className="text-[13px] text-ink-muted">
                      {session.free ? `${session.theme} \u00b7 Free` : session.theme}
                    </span>
                  </span>
                  <span className="flex pt-[3px] text-ink-muted">{isRowLocked && <LockIcon />}</span>
                </button>
              );
            })}
            {!membershipLoading && !isMember && MEMBER_ONLY_COUNT > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline py-[18px] text-[15px] text-ink-muted">
                <span>{moreSessionsLabel(MEMBER_ONLY_COUNT)} with SleepCode+</span>
                <Link href="/pricing" className="sc-link">
                  {PRICES.year.amount} {PRICES.year.label}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={!!lockedSession} onClose={() => setLockedSession(null)} label="SleepCode+">
        {lockedSession && (
          <>
            <SheetHeader title={lockedSession.title} onCancel={() => setLockedSession(null)} />
            <p className="text-[15px] leading-[1.6] text-ink-muted">
              {lockedSession.title} is part of SleepCode+. Add {moreSessionsLabel(MEMBER_ONLY_COUNT)} for{' '}
              {PRICES[interval].amount} {PRICES[interval].label}. {PRICES[interval].note}
            </p>
            <div className="flex flex-wrap items-center gap-[14px]">
              <BillingToggle value={interval} onChange={setBillingInterval} />
              <button
                type="button"
                onClick={() => billing.startCheckout(interval)}
                disabled={billing.busy}
                className="sc-btn"
              >
                {billing.busy ? 'Opening checkout\u2026' : 'Upgrade to SleepCode+'}
              </button>
            </div>
            {billing.error && <StatusText status={{ type: 'error', text: billing.error }} />}
          </>
        )}
      </Sheet>
    </AppShell>
  );
}
