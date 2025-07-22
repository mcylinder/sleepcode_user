'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionStatus, getSubscriptionStatusText, SubscriptionStatus, hasSubscription } from '@/lib/revenuecat';

export default function AccountPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setSubscriptionLoading(true);
      const status = await getSubscriptionStatus(currentUser.uid);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (currentUser) {
      fetchSubscriptionStatus();
    }
  }, [currentUser, fetchSubscriptionStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect to login
  }

  const statusText = getSubscriptionStatusText(subscriptionStatus);
  const statusColor = statusText === 'Active' ? 'text-green-600' : 
                     statusText === 'Expired' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-sm">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-shrink-0">
                  {currentUser.photoURL ? (
                    <img
                      className="h-12 w-12"
                      src={currentUser.photoURL}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                      {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {currentUser.displayName || 'User'}!
                  </h1>
                  <p className="text-gray-600">{currentUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Account Information */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="text-sm text-gray-900 font-mono">{currentUser.uid}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email Verified</dt>
                      <dd className="text-sm text-gray-900">
                        {currentUser.emailVerified ? 'Yes' : 'No'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                      <dd className="text-sm text-gray-900">
                        {currentUser.metadata.creationTime ? 
                          new Date(currentUser.metadata.creationTime).toLocaleDateString() : 
                          'Unknown'
                        }
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Subscription Status */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Status</h3>
                  {subscriptionLoading ? (
                    <div className="text-sm text-gray-500">Loading subscription status...</div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className={`text-sm font-medium ${statusColor}`}>
                          {statusText}
                        </dd>
                      </div>
                      
                      {subscriptionStatus && Object.keys(subscriptionStatus.subscriber.entitlements).length > 0 && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Active Entitlements</dt>
                          <dd className="text-sm text-gray-900">
                            {Object.keys(subscriptionStatus.subscriber.entitlements).join(', ')}
                          </dd>
                        </div>
                      )}

                      <div className="pt-4">
                        <a
                          href="https://app.revenuecat.com/account/management"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm inline-block"
                        >
                          Manage Subscription
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription-based content */}
              {hasSubscription() ? (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900 mb-2">🎉 Premium Features Active</h3>
                  <p className="text-green-700 mb-4">
                    You have access to all premium features including advanced analytics, unlimited sessions, and priority support.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">∞</div>
                      <div className="text-sm text-green-700">Unlimited Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">📊</div>
                      <div className="text-sm text-green-700">Advanced Analytics</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">⭐</div>
                      <div className="text-sm text-green-700">Priority Support</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">🚀 Upgrade to Premium</h3>
                  <p className="text-blue-700 mb-4">
                    Unlock unlimited sessions, advanced analytics, and priority support with our premium subscription.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="/pricing"
                      className="btn-primary text-center"
                    >
                      View Pricing
                    </a>
                    <a
                      href="/sessions"
                      className="btn-secondary text-center"
                    >
                      Try Free Features
                    </a>
                  </div>
                </div>
              )}

              {/* Future Phase 2 Placeholder */}
              <div className="mt-8 card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Coming Soon</h3>
                <p className="text-gray-600">
                  In the next phase, you&apos;ll be able to create and manage your personal content here.
                  This area will be expanded to include text-based data creation and management features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 