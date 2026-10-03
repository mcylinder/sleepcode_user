'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { playerHref, type Session } from '@/lib/catalog';
import { useDissolve } from './Dissolve';

// A "play" entry point for a free session. Signed-in visitors dissolve straight into the
// player; everyone else creates an account first and lands in the player afterwards.
export default function PlayLink({
  session,
  className,
  children,
}: {
  session: Session;
  className?: string;
  children: React.ReactNode;
}) {
  const { currentUser } = useAuth();
  const dissolveTo = useDissolve();
  const href = playerHref(session);

  if (!currentUser) {
    return (
      <Link href={`/login?mode=signup&next=${encodeURIComponent(href)}`} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        dissolveTo(href);
      }}
    >
      {children}
    </a>
  );
}
