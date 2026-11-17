'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { findSession, scriptHref } from '@/lib/catalog';

/** Legacy `?session=` URL → canonical SSR transcript. */
function ScriptRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const session = findSession(params.get('session'));
    router.replace(session ? scriptHref(session) : '/application');
  }, [params, router]);

  return (
    <main className="sc-frame sc-px py-10">
      <p className="text-[15px] text-ink-muted">Opening transcript\u2026</p>
    </main>
  );
}

export default function ScriptPage() {
  return (
    <Suspense fallback={null}>
      <ScriptRedirect />
    </Suspense>
  );
}
