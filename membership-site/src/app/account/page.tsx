'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useReauth } from '@/components/account/useReauth';
import AppShell from '@/components/ui/AppShell';
import { AccountSection, ExpandableRow } from '@/components/account/Section';
import MembershipSection from '@/components/account/MembershipSection';
import DefaultsSection from '@/components/account/DefaultsSection';
import VerifyEmailNotice from '@/components/account/VerifyEmailNotice';
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
  const PROVIDER_NAMES: Record<string, string> = {
    password: 'Email',
    'google.com': 'Google',
    'apple.com': 'Apple',
    'facebook.com': 'Facebook',
  };
  const methodNames =
    currentUser.providerData.map((p) => PROVIDER_NAMES[p.providerId] ?? p.providerId).join(', ') || 'None';
  const hasPassword = currentUser.providerData.some((p) => p.providerId === 'password');

  async function handleLogout() {
    await logout().catch(() => undefined);
    window.location.replace('/');
  }

  return (
    <AppShell active="account" maxWidth={720}>
      <div className="flex flex-col gap-[38px]">
        <h1 className="sc-h-app">Account</h1>

        <MembershipSection justCheckedOut={justCheckedOut} />
        <DefaultsSection />

        <AccountSection title="Account details">
          <ExpandableRow
            label="Email"
            value={currentUser.email ?? 'No email on file'}
            open={openRow === 'email'}
            onToggle={() => toggle('email')}
          >
            <EmailPanel withRecentLogin={withRecentLogin} />
          </ExpandableRow>
          <VerifyEmailNotice />
          {hasPassword && (
            <ExpandableRow label="Password" open={openRow === 'password'} onToggle={() => toggle('password')}>
              <PasswordPanel withRecentLogin={withRecentLogin} />
            </ExpandableRow>
          )}
          <ExpandableRow
            label="Sign-in methods"
            value={methodNames}
            open={openRow === 'methods'}
            onToggle={() => toggle('methods')}
          >
            <SignInMethodsPanel withRecentLogin={withRecentLogin} />
          </ExpandableRow>
          <div className="border-t border-hairline pt-5">
            <button type="button" onClick={handleLogout} className="sc-btn-outline">
              Sign out
            </button>
          </div>
        </AccountSection>

        <ExpandableRow label="Delete account" quiet open={openRow === 'delete'} onToggle={() => toggle('delete')}>
          <DeleteAccountPanel reauthenticate={reauthenticate} />
        </ExpandableRow>
      </div>

      {dialog}
    </AppShell>
  );
}
