import Link from 'next/link';
import { JOURNAL_POSTS, journalDate } from '@/data/journal';

export default function JournalIndexPage() {
  return (
    <div className="sc-px pb-[var(--pad-section)]">
      <div className="flex max-w-[760px] flex-col gap-[18px] pb-[clamp(32px,4vw,48px)] pt-[clamp(28px,5vw,72px)]">
        <span className="sc-eyebrow">Journal</span>
        <h1 className="sc-h-page">Notes on how SleepCode is made.</h1>
      </div>
      <div className="flex max-w-[860px] flex-col">
        {JOURNAL_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/journal/${post.slug}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-t border-[rgba(44,38,32,0.16)] py-[18px]"
          >
            <span className="flex flex-col gap-1">
              <span className="text-[18px] font-semibold leading-[1.35]">{post.title}</span>
              <span className="text-[16px] leading-[1.6] text-ink-muted">{post.dek}</span>
            </span>
            <span className="font-mono text-[13px] text-ink-muted">{journalDate(post.date)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
