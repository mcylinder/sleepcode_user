'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useReauth } from '@/components/account/useReauth';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import { AccountSection, ExpandableRow } from '@/components/account/Section';
import IdentityBlock from '@/components/account/IdentityBlock';
import MembershipSection from '@/components/account/MembershipSection';
import PreferencesSection from '@/components/account/PreferencesSection';
import EmailPanel from '@/components/account/EmailPanel';
import PasswordPanel from '@/components/account/PasswordPanel';
import SignInMethodsPanel from '@/components/account/SignInMethodsPanel';
import DeleteAccountPanel from '@/components/account/DeleteAccountPanel';

type Row = 'email' | 'password' | 'methods' | 'delete';

export default function AccountPage() {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const { reauthenticate, withRecentLogin, dialog } = useReauth();
  const [justCheckedOut, setJustCheckedOut] = useState(false);
  const [openRow, setOpenRow] = useState<Row | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?next=/account');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setJustCheckedOut(true);
      window.history.replaceState(null, '', '/account');
    }
  }, []);

  if (loading || !currentUser) {
    return null;
  }

  const toggle = (row: Row) => setOpenRow((current) => (current === row ? null : row));
  const methodCount = currentUser.providerData.length;

  async function handleLogout() {
    await logout().catch(() => undefined);
    window.location.replace('/');
  }

  return (
    <AppShell
      active="account"
      topbar={
        <div className="flex justify-center">
          <div className="sc-eyebrow--muted">SleepCode</div>
        </div>
      }
    >
      <div className="wide:max-w-[560px]">
        <IdentityBlock />
        <MembershipSection justCheckedOut={justCheckedOut} />
        <PreferencesSection />

        <AccountSection title="Account">
          <ExpandableRow label="Change Email" open={openRow === 'email'} onToggle={() => toggle('email')}>
            <EmailPanel withRecentLogin={withRecentLogin} />
          </ExpandableRow>
          <ExpandableRow label="Password" open={openRow === 'password'} onToggle={() => toggle('password')}>
            <PasswordPanel withRecentLogin={withRecentLogin} />
          </ExpandableRow>
          <ExpandableRow
            label="Sign-in Methods"
            value={`${methodCount} connected`}
            open={openRow === 'methods'}
            onToggle={() => toggle('methods')}
          >
            <SignInMethodsPanel withRecentLogin={withRecentLogin} />
          </ExpandableRow>
          <ExpandableRow label="Delete Account" open={openRow === 'delete'} onToggle={() => toggle('delete')}>
            <DeleteAccountPanel reauthenticate={reauthenticate} />
          </ExpandableRow>
          <button
            onClick={handleLogout}
            className="w-full py-4 text-left text-[15px] font-medium text-fg-muted hover:text-fg wide:py-[15px] wide:text-[14px]"
          >
            Log Out
          </button>
        </AccountSection>

        <div className="mt-[34px] flex items-center justify-between pb-5">
          <span className="sc-eyebrow--muted text-[10px]">SleepCode</span>
          <span className="text-[11px] text-fg-faint">
            <Link href="/privacy" className="hover:text-fg-muted">Privacy</Link> &middot;{' '}
            <Link href="/terms" className="hover:text-fg-muted">Terms</Link>
          </span>
        </div>
      </div>

      {dialog}
    </AppShell>
  );
}
