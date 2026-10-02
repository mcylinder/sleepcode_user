// Long-form reading layout: the measure is capped and does not widen past 900px.
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
    <article className="mx-auto w-full max-w-[700px]">
      <header className="px-[30px] pt-[34px] wide:px-[60px] wide:pt-[50px]">
        <div className="sc-eyebrow">{eyebrow}</div>
        <h1 className="mt-[10px] text-[25px] font-semibold leading-[1.3] wide:mt-3 wide:max-w-[560px] wide:text-[34px] wide:leading-[1.25]">
          {title}
        </h1>
        {dek && (
          <p className="mt-[10px] text-[14px] leading-[1.5] text-fg-muted wide:mt-3 wide:max-w-[480px] wide:text-[15px] wide:leading-[1.55]">
            {dek}
          </p>
        )}
        <div className="mt-4 border-b border-line pb-[22px] text-[12px] text-fg-faint wide:mt-[18px] wide:pb-[26px]">
          {byline}
        </div>
      </header>
      <div className="px-[30px] pt-6 wide:px-[60px] wide:pt-[30px]">{children}</div>
    </article>
  );
}
