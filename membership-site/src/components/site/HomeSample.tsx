'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FEATURED_FREE_SESSION, scriptHref } from '@/lib/catalog';
import { fetchSessionMedia } from '@/lib/authedFetch';
import { buildScript, type SessionManifest } from '@/lib/audio/playPlan';

const SAMPLE_SIZE = 5;

// Home "A sample": the first line of the first few concepts, read from the same manifest.json
// the player and script page use. Hidden until the manifest has text, so nothing invented is shown.
export default function HomeSample() {
  const free = FEATURED_FREE_SESSION;
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!free) return;
    let cancelled = false;
    (async () => {
      try {
        const signed = await fetchSessionMedia(free.id);
        const response = await fetch(`${signed.baseUrl}manifest.json?${signed.query}`);
        if (!response.ok) return;
        const concepts = buildScript((await response.json()) as SessionManifest);
        if (!cancelled) setLines(concepts.slice(0, SAMPLE_SIZE).map((c) => c.lines[0]));
      } catch {
        // No sample if the manifest can't be read.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [free]);

  if (!free || !lines.length) return null;

  return (
    <section className="sc-section grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,5vw,72px)]">
      <div className="flex flex-col gap-[18px]">
        <span className="sc-eyebrow">A sample</span>
        <h2 className="sc-h-section">Every word, in plain sight.</h2>
      </div>
      <div className="flex max-w-[620px] flex-col gap-5">
        <ul className="flex flex-col gap-3 text-[clamp(17px,1.6vw,20px)] leading-[1.55] text-ink-body">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <Link href={scriptHref(free)} className="sc-link self-start text-[16px]">
          Read every statement
        </Link>
      </div>
    </section>
  );
}
