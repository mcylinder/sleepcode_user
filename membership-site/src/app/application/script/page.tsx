'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { findSession, sessionLabel, type Session } from '@/lib/catalog';
import { fetchSessionMedia } from '@/lib/authedFetch';
import { buildScript, type ScriptConcept, type SessionManifest } from '@/lib/audio/playPlan';
import PlayLink from '@/components/ui/PlayLink';
import Logo from '@/components/ui/Logo';

type ScriptState =
  | { kind: 'loading' }
  | { kind: 'ready'; concepts: ScriptConcept[] }
  | { kind: 'empty' }
  | { kind: 'locked' };

// The script comes from the same manifest.json the player uses, so the page always matches the audio.
function useScript(session: Session | null): ScriptState {
  const [state, setState] = useState<ScriptState>({ kind: 'loading' });

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setState({ kind: 'loading' });
    (async () => {
      try {
        const signed = await fetchSessionMedia(session.id);
        const response = await fetch(`${signed.baseUrl}manifest.json?${signed.query}`);
        if (!response.ok) throw new Error('manifest');
        const concepts = buildScript((await response.json()) as SessionManifest);
        if (!cancelled) setState(concepts.length ? { kind: 'ready', concepts } : { kind: 'empty' });
      } catch {
        if (!cancelled) setState(session.free ? { kind: 'empty' } : { kind: 'locked' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  return state;
}

const num = (n: number) => String(n).padStart(2, '0');

function ScriptBody() {
  const params = useSearchParams();
  const session = findSession(params.get('session'));
  const script = useScript(session);

  if (!session) {
    return (
      <main className="sc-frame sc-px py-10">
        <Logo />
        <div className="mx-auto mt-12 flex max-w-[640px] flex-col gap-4">
          <h1 className="sc-h-page">Statements</h1>
          <p className="text-[15px] text-ink-muted">That session wasn&rsquo;t found.</p>
          <Link href="/" className="sc-link self-start">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const count = script.kind === 'ready' ? script.concepts.reduce((n, c) => n + c.lines.length, 0) : 0;

  return (
    <main className="sc-frame">
      <div className="sc-px py-[22px]">
        <Logo />
      </div>
      <div className="sc-px mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-8 pb-[var(--pad-section)]">
        <div className="flex flex-col gap-2">
          <span className="sc-eyebrow">Statements</span>
          <h1 className="sc-h-page">{sessionLabel(session)}</h1>
          <p className="sc-lead">
            {script.kind === 'ready'
              ? `Every word spoken in this session: ${count} statements in ${script.concepts.length} groups. Each group says one idea a few different ways, and the session moves through them in a shuffled order.`
              : script.kind === 'locked'
                ? 'These statements will be available when the session is.'
                : script.kind === 'loading'
                  ? 'Loading the statements…'
                  : 'Every statement spoken in this session will appear here soon.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {session.free && (
            <PlayLink session={session} className="sc-btn">
              Hear this session
            </PlayLink>
          )}
          <Link href="/application" className="sc-btn-outline">
            Library
          </Link>
        </div>

        {script.kind === 'ready' && (
          <ol className="flex flex-col">
            {script.concepts.map((concept, i) => (
              <li
                key={concept.id}
                className="grid grid-cols-[30px_1fr] gap-[14px] border-t border-hairline py-[18px]"
              >
                <span className="pt-[3px] font-mono text-[12px] text-ink-muted">{num(i + 1)}</span>
                <div className="flex flex-col gap-[6px]">
                  {concept.title && <span className="text-[13px] font-semibold text-ink-muted">{concept.title}</span>}
                  {concept.lines.map((line, j) => (
                    <p key={j} className="text-[17px] leading-[1.55] text-ink">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

export default function ScriptPage() {
  return (
    <Suspense fallback={null}>
      <ScriptBody />
    </Suspense>
  );
}
