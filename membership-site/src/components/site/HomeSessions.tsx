import Link from 'next/link';
import { FEATURED_FREE_SESSION, SESSIONS, isComingSoon, sessionLabel, type Session } from '@/lib/catalog';
import PlayLink from '@/components/ui/PlayLink';

const ROW = 'grid grid-cols-[30px_1fr_auto] items-start gap-[14px] border-t border-hairline py-[15px]';

function RowBody({ session, index }: { session: Session; index: number }) {
  return (
    <>
      <span className="pt-[4px] font-mono text-[12px] text-ink-muted">{String(index + 1).padStart(2, '0')}</span>
      <div className="flex min-w-0 flex-col gap-[3px]">
        <span className="text-[16px] font-semibold">{sessionLabel(session)}</span>
        {session.description ? (
          <span className="max-w-[60ch] text-[14px] leading-[1.5] text-ink-body">{session.description}</span>
        ) : null}
      </div>
    </>
  );
}

// Beta home list: one free playable session (whole row plays), the rest marked Coming soon (no prices).
export default function HomeSessions() {
  const free = FEATURED_FREE_SESSION;

  return (
    <div className="flex flex-col">
      {SESSIONS.map((session, i) => {
        const soon = isComingSoon(session);
        const playable = !soon && free && session.id === free.id;

        if (playable) {
          return (
            <PlayLink
              key={session.id}
              session={session}
              className={`${ROW} group transition-colors hover:bg-[rgba(44,38,32,0.04)]`}
            >
              <RowBody session={session} index={i} />
              <span className="whitespace-nowrap pt-[3px] text-[13px] font-medium text-accent group-hover:underline">
                Play free &#9656;
              </span>
            </PlayLink>
          );
        }

        return (
          <div key={session.id} className={ROW}>
            <RowBody session={session} index={i} />
            <span className="pt-[3px] text-[13px] text-ink-muted">{soon ? 'Coming soon' : 'Free'}</span>
          </div>
        );
      })}
      <Link href="/application" className="sc-link self-start border-t border-hairline pt-[18px] text-[16px]">
        Open the library
      </Link>
    </div>
  );
}
