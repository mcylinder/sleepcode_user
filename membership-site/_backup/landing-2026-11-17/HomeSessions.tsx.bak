import Link from 'next/link';
import {
  FEATURED_FREE_SESSION,
  THEMES,
  findSession,
  needsMembership,
  sessionLabel,
  type Session,
} from '@/lib/catalog';
import PlayLink from '@/components/ui/PlayLink';

/** Home featured (besides the free session): optimism, steadiness, speaking up. */
const FEATURED_PAID_IDS = ['open-door', 'steady-ground', 'the-presentation'] as const;

const ROW = 'grid grid-cols-[1fr_auto] items-start gap-[14px] border-t border-hairline py-[15px]';

function FeaturedRow({ session }: { session: Session }) {
  const body = (
    <div className="flex min-w-0 flex-col gap-[3px]">
      <span className="text-[16px] font-semibold">{sessionLabel(session)}</span>
      {session.description ? (
        <span className="max-w-[60ch] text-[14px] leading-[1.5] text-ink-body">{session.description}</span>
      ) : null}
    </div>
  );

  if (!needsMembership(session)) {
    return (
      <PlayLink
        session={session}
        className={`${ROW} group transition-colors hover:bg-[rgba(44,38,32,0.04)]`}
      >
        {body}
        <span className="whitespace-nowrap pt-[3px] text-[13px] font-medium text-accent group-hover:underline">
          Play free &#9656;
        </span>
      </PlayLink>
    );
  }

  return (
    <Link
      href="/pricing"
      className={`${ROW} group transition-colors hover:bg-[rgba(44,38,32,0.04)]`}
    >
      {body}
      <span className="whitespace-nowrap pt-[3px] text-[13px] font-medium text-ink-muted group-hover:text-accent group-hover:underline">
        SleepCode+
      </span>
    </Link>
  );
}

export default function HomeSessions() {
  const free = FEATURED_FREE_SESSION;
  const featured = [
    ...(free ? [free] : []),
    ...FEATURED_PAID_IDS.map((id) => findSession(id)).filter((s): s is Session => !!s),
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <span className="sc-eyebrow sc-eyebrow--muted">Goals</span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-x-6 gap-y-1">
          {THEMES.map((theme) => (
            <Link
              key={theme}
              href={`/application?theme=${encodeURIComponent(theme)}`}
              className="border-t border-hairline py-[14px] text-[16px] font-semibold transition-colors hover:text-accent"
            >
              {theme}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="sc-eyebrow sc-eyebrow--muted pb-1">Featured</span>
        {featured.map((session) => (
          <FeaturedRow key={session.id} session={session} />
        ))}
        <Link href="/application" className="sc-link self-start border-t border-hairline pt-[18px] text-[16px]">
          Open the library
        </Link>
      </div>
    </div>
  );
}
