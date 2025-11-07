'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const hasAccepted = localStorage.getItem('cookie-banner-accepted');
    if (!hasAccepted) {
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
      className="fixed inset-x-0 bottom-0 bg-[#340c35] text-white p-4 z-50"
      role="region" 
      aria-label="Cookie notice"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <p className="text-sm leading-relaxed m-0 flex-1">
          SleepCode uses <strong>only essential cookies</strong> to keep you logged in and secure. No ads, no trackers.
          See our{' '}
          <Link 
            href="/cookies" 
            className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex-shrink-0">
          <button
            onClick={handleAccept}
            className="bg-[#4e88dd] text-white border-0 px-6 py-3 cursor-pointer rounded-md text-sm font-semibold hover:bg-[#340c35] transition-colors duration-200 shadow-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
