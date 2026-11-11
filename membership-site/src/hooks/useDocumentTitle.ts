'use client';

import { useEffect } from 'react';

const SITE_NAME = 'SleepCode';

/** Sets `document.title` for client routes that cannot export Metadata. */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} · ${SITE_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
