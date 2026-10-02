'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { isActiveStatus, type Membership } from '@/lib/membership';

interface MembershipState {
  membership: Membership | null;
  isMember: boolean;
  loading: boolean;
}

function parseMembership(raw: unknown): Membership | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const periodEnd = data.currentPeriodEnd;
  return {
    status: typeof data.status === 'string' ? data.status : 'none',
    interval: data.interval === 'month' || data.interval === 'year' ? data.interval : null,
    currentPeriodEnd: periodEnd instanceof Timestamp ? periodEnd.toDate() : null,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
    subscriptionId: typeof data.subscriptionId === 'string' ? data.subscriptionId : null,
  };
}

export function useMembership(): MembershipState {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid ?? null;
  const [state, setState] = useState<MembershipState>({ membership: null, isMember: false, loading: true });

  useEffect(() => {
    if (!uid || !db) {
      setState({ membership: null, isMember: false, loading: false });
      return;
    }

    setState((previous) => ({ ...previous, loading: true }));
    return onSnapshot(
      doc(db, 'users', uid),
      (snapshot) => {
        const membership = parseMembership(snapshot.get('membership'));
        setState({ membership, isMember: isActiveStatus(membership?.status), loading: false });
      },
      (error) => {
        console.error('Error loading membership:', error);
        setState({ membership: null, isMember: false, loading: false });
      },
    );
  }, [uid]);

  return state;
}
