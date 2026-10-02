'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useReauth } from '@/components/account/useReauth';
import MembershipCard from '@/components/account/MembershipCard';
import ProfileCard from '@/components/account/ProfileCard';
import SignInMethodsCard from '@/components/account/SignInMethodsCard';
import PasswordCard from '@/components/account/PasswordCard';
import DeleteAccountCard from '@/components/account/DeleteAccountCard';

export default function AccountPage() {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const { reauthenticate, withRecentLogin, dialog } = useReauth();
  const [justCheckedOut, setJustCheckedOut] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  const initial = (currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#fcf0e8]">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {currentUser.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="h-12 w-12 rounded-full" src={currentUser.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-12 w-12 bg-gradient-to-tl from-[#340c35] to-[#4e88dd] flex items-center justify-center text-white font-medium shadow-lg rounded-full border-2 border-white">
                {initial}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser.displayName ? `Welcome, ${currentUser.displayName}` : 'Your account'}
              </h1>
              <p className="text-gray-600 text-sm">{currentUser.email}</p>
            </div>
          </div>
          <button onClick={() => logout()} className="text-sm text-gray-700 hover:text-gray-900 whitespace-nowrap">
            Sign out
          </button>
        </div>

        <div className="space-y-6">
          <MembershipCard justCheckedOut={justCheckedOut} />
          <ProfileCard withRecentLogin={withRecentLogin} />
          <SignInMethodsCard withRecentLogin={withRecentLogin} />
          <PasswordCard withRecentLogin={withRecentLogin} />
          <DeleteAccountCard reauthenticate={reauthenticate} />
        </div>
      </div>

      {dialog}
    </div>
  );
}
