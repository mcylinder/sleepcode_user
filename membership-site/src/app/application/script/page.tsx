'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { findSession, sessionLabel } from '@/lib/catalog';
import PlayLink from '@/components/ui/PlayLink';
import Logo from '@/components/ui/Logo';

function ScriptBody() {
  const params = useSearchParams();
  const session = findSession(params.get('session'));

  if (!session) {
    return (
      <main className="sc-frame sc-px py-10">
        <Logo />
        <div className="mx-auto mt-12 flex max-w-[640px] flex-col gap-4">
          <h1 className="sc-h-page">Script</h1>
          <p className="text-[15px] text-ink-muted">That session wasn&rsquo;t found.</p>
          <Link href="/" className="sc-link self-start">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="sc-frame">
      <div className="sc-px py-[22px]">
        <Logo />
      </div>
      <div className="sc-px mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 pb-[var(--pad-section)]">
        <div className="flex flex-col gap-2">
          <span className="sc-eyebrow">Script</span>
          <h1 className="sc-h-page">{sessionLabel(session)}</h1>
          <p className="sc-lead">
            Every word spoken in this session will appear here. The full script is coming soon.
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
