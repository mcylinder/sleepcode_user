'use client';

import { playerHref, type Session } from '@/lib/catalog';
import { useAuth } from '@/contexts/AuthContext';
import { useDissolve } from './Dissolve';

// Free-session play entry. Signed-out visitors go to a free sign-up first, then straight to the player.
export default function PlayLink({
  session,
  className,
  children,
}: {
  session: Session;
  className?: string;
  children: React.ReactNode;
}) {
  const dissolveTo = useDissolve();
  const { currentUser } = useAuth();
  const player = playerHref(session);
  const href = currentUser ? player : `/login?mode=signup&next=${encodeURIComponent(player)}`;

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (!currentUser || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        dissolveTo(href);
      }}
    >
      {children}
    </a>
  );
}
