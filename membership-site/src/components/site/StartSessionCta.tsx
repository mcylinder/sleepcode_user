'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function StartSessionCta() {
  const { currentUser } = useAuth();
  return (
    <Link href={currentUser ? '/application' : '/login?mode=signup'} className="sc-cta">
      Start a Free Session
    </Link>
  );
}
