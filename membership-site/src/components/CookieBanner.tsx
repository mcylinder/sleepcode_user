'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!localStorage.getItem('cookie-banner-accepted')) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-banner-accepted', 'true');
    setIsVisible(false);
  };

  // The player stays dark and uncluttered; the notice waits for the next sand page.
  if (!isVisible || pathname.startsWith('/application/player')) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-bg-alt px-[var(--pad-x)] pb-[calc(14px+env(safe-area-inset-bottom,0px))] pt-[14px]"
      role="region"
      aria-label="Cookie notice"
    >
      <div className="mx-auto flex max-w-[1060px] items-center justify-between gap-6">
        <p className="text-[14px] leading-[1.5] text-ink-muted">
          SleepCode uses only essential cookies to keep you signed in. No ads, no trackers.{' '}
          <Link href="/cookies" className="sc-link">Cookie policy</Link>
        </p>
        <button type="button" onClick={handleAccept} className="sc-textbtn min-h-[44px] flex-shrink-0">
          OK
        </button>
      </div>
    </div>
  );
}
