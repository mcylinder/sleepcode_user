'use client';

import { useEffect, useRef } from 'react';

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const originalBodyBg = useRef<string | null>(null);
  const originalHtmlBg = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (originalBodyBg.current === null) {
      originalBodyBg.current = document.body.style.backgroundColor || '';
    }
    if (originalHtmlBg.current === null) {
      originalHtmlBg.current = document.documentElement.style.backgroundColor || '';
    }

    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';

    return () => {
      if (typeof document === 'undefined') {
        return;
      }
      document.body.style.backgroundColor = originalBodyBg.current ?? '';
      document.documentElement.style.backgroundColor = originalHtmlBg.current ?? '';
    };
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">
      {children}
    </div>
  );
}

