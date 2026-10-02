'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie-banner-accepted')) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-banner-accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg-soft px-[26px] pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-4"
      role="region"
      aria-label="Cookie notice"
    >
      <div className="mx-auto flex max-w-[1060px] items-center justify-between gap-6">
        <p className="text-[12px] leading-relaxed text-fg-muted">
          SleepCode uses only essential cookies to keep you signed in. No ads, no trackers.{' '}
          <Link href="/cookies" className="sc-link">Cookie Policy</Link>
        </p>
        <button onClick={handleAccept} className="sc-textbtn flex-shrink-0">
          OK
        </button>
      </div>
    </div>
  );
}
