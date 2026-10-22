import Link from 'next/link';
import { FEATURED_FREE_SESSION, SESSIONS, isComingSoon, sessionLabel } from '@/lib/catalog';
import PlayLink from '@/components/ui/PlayLink';

// Beta home list: one free playable session, the rest marked Coming soon (no prices).
export default function HomeSessions() {
  const free = FEATURED_FREE_SESSION;

  return (
    <div className="flex flex-col">
      {SESSIONS.map((session, i) => {
        const soon = isComingSoon(session);
        return (
          <div
            key={session.id}
            className="grid grid-cols-[30px_1fr_auto] items-start gap-[14px] border-t border-hairline py-[15px]"
          >
            <span className="pt-[4px] font-mono text-[12px] text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-[16px] font-semibold">{sessionLabel(session)}</span>
              {session.description ? (
                <span className="max-w-[60ch] text-[14px] leading-[1.5] text-ink-body">{session.description}</span>
              ) : null}
            </div>
            <span className="pt-[3px] text-[13px] text-ink-muted">
              {soon ? (
                'Coming soon'
              ) : free && session.id === free.id ? (
                <PlayLink session={session} className="sc-link font-medium">
                  Free
                </PlayLink>
              ) : (
                'Free'
              )}
            </span>
          </div>
        );
      })}
      <Link href="/application" className="sc-link self-start border-t border-hairline pt-[18px] text-[16px]">
        Open the library
      </Link>
    </div>
  );
}
