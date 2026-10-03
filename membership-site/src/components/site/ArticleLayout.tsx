// General-info template: an intro block (max 760px) over a reading column (max 680px).
export default function ArticleLayout({
  eyebrow,
  title,
  dek,
  byline,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  dek?: React.ReactNode;
  byline?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="sc-px pb-[var(--pad-section)]">
      <header className="flex max-w-[760px] flex-col gap-[18px] pb-[clamp(32px,4vw,48px)] pt-[clamp(28px,5vw,72px)]">
        <span className="sc-eyebrow">{eyebrow}</span>
        <h1 className="sc-h-page">{title}</h1>
        {dek && <p className="sc-lead">{dek}</p>}
        {byline && <span className="text-[15px] text-ink-muted">{byline}</span>}
      </header>
      <div className="max-w-[680px]">{children}</div>
    </article>
  );
}
