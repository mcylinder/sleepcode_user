import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FEATURED_FREE_SESSION } from '@/lib/catalog';
import { JOURNAL_POSTS, findPost, journalDate, type JournalBlock } from '@/data/journal';
import PlayLink from '@/components/ui/PlayLink';

export function generateStaticParams() {
  return JOURNAL_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = findPost((await params).slug);
  return post ? { title: `${post.title} \u2014 SleepCode`, description: post.dek } : {};
}

function Block({ block }: { block: JournalBlock }) {
  switch (block.type) {
    case 'p':
      return <p>{block.text}</p>;
    case 'h2':
      return <h2 className="sc-h-article mt-[18px]">{block.text}</h2>;
    case 'quote':
      return <p className="sc-pullquote">{block.text}</p>;
    case 'list':
      return (
        <ol className="flex flex-col">
          {block.items.map((item, i) => (
            <li
              key={item}
              className="grid grid-cols-[34px_1fr] gap-2 border-t border-hairline py-3 last:border-b"
            >
              <span className="font-mono text-[13px] leading-[1.9] text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
  }
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = findPost((await params).slug);
  if (!post) notFound();
  const related = JOURNAL_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  const free = FEATURED_FREE_SESSION;

  return (
    <>
      <article className="sc-px flex flex-col items-center pt-[clamp(24px,5vw,64px)]">
        <div className="flex w-full max-w-[720px] flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3 text-[14px] text-ink-muted">
            <Link href="/journal" className="sc-eyebrow">Journal</Link>
            <span aria-hidden>&middot;</span>
            <time dateTime={post.date} className="font-mono text-[13px]">{journalDate(post.date)}</time>
          </div>
          <h1 className="m-0 text-[clamp(36px,4.8vw,58px)] font-medium leading-[1.04] tracking-[-0.03em]">{post.title}</h1>
          <p className="text-[clamp(19px,1.8vw,22px)] leading-[1.5] text-ink-muted">{post.dek}</p>
          <span className="pt-1 text-[15px]">{post.byline}</span>
        </div>

        <div className="sc-placeholder my-[clamp(28px,4vw,48px)] aspect-[16/8] w-full max-w-[1000px]">post image</div>

        <div className="flex w-full max-w-[680px] flex-col gap-[22px] text-[clamp(17px,1.5vw,19px)] leading-[1.7] text-ink-body">
          {post.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {free && (
          <div className="my-[clamp(40px,5vw,64px)] flex w-full max-w-[680px] flex-wrap items-center justify-between gap-[18px] border-t border-hairline-strong py-[26px]">
            <span className="text-[18px] font-medium">Try {free.title}, free.</span>
            <PlayLink session={free} className="sc-btn">Play it now</PlayLink>
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="sc-band sc-px flex flex-col gap-5 py-[clamp(40px,6vw,80px)]">
          <span className="sc-eyebrow">More from the journal</span>
          <div className="flex flex-col">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/journal/${r.slug}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-t border-[rgba(44,38,32,0.16)] py-[18px]"
              >
                <span className="text-[18px] font-semibold leading-[1.35]">{r.title}</span>
                <span className="font-mono text-[13px] text-ink-muted">{journalDate(r.date)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
