'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';

// Shows its children to everyone except SleepCode+ members (who already know how it works).
export function ForVisitors({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { isMember, loading } = useMembership();
  if (currentUser && (loading || isMember)) return null;
  return <>{children}</>;
}

// Shows its children only to SleepCode+ members.
export function ForMembers({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { isMember, loading } = useMembership();
  if (!currentUser || loading || !isMember) return null;
  return <>{children}</>;
}
