'use client';

import { playerHref, type Session } from '@/lib/catalog';
import { useDissolve } from './Dissolve';

// Free-session play entry. Goes straight to the player — no account required.
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
  const href = playerHref(session);

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
