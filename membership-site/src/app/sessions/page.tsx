'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hasSubscription } from '@/lib/revenuecat';

interface SleepSession {
  id: string;
  date: string;
  duration: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

export default function SessionsPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Mock data for demonstration
  const mockSessions: SleepSession[] = [
    {
      id: '1',
      date: '2024-01-15',
      duration: '7h 32m',
      quality: 'excellent',
      notes: 'Deep sleep, felt refreshed'
    },
    {
      id: '2',
      date: '2024-01-14',
      duration: '6h 45m',
      quality: 'good',
      notes: 'Slept well, minor interruptions'
    },
    {
      id: '3',
      date: '2024-01-13',
      duration: '8h 15m',
      quality: 'excellent',
      notes: 'Perfect sleep cycle'
    },
    {
      id: '4',
      date: '2024-01-12',
      duration: '5h 20m',
      quality: 'fair',
      notes: 'Stressful day, restless sleep'
    },
    {
      id: '5',
      date: '2024-01-11',
      duration: '7h 8m',
      quality: 'good'
    }
  ];

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    // Simulate loading sessions
    const loadSessions = async () => {
      setSessionsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions(mockSessions);
      setSessionsLoading(false);
    };

    if (currentUser) {
      loadSessions();
    }
  }, [currentUser]);

  const getQualityColor = (quality: SleepSession['quality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityLabel = (quality: SleepSession['quality']) => {
    return quality.charAt(0).toUpperCase() + quality.slice(1);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-sm">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Sleep Sessions</h1>
                <p className="mt-2 text-gray-600">Track and analyze your sleep patterns</p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-600">Total Sessions</div>
                  <div className="text-2xl font-bold text-blue-900">{sessions.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-600">Average Duration</div>
                  <div className="text-2xl font-bold text-green-900">7h 2m</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">Best Quality</div>
                  <div className="text-2xl font-bold text-purple-900">Excellent</div>
                </div>
              </div>

              {/* Subscription Status Banner */}
              {!hasSubscription() && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-600">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Free Plan - Limited Sessions
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        You&apos;re currently on the free plan. Upgrade to premium for unlimited sessions and advanced analytics.
                      </p>
                    </div>
                    <div className="ml-auto">
                      <a
                        href="/pricing"
                        className="btn-primary text-sm"
                      >
                        Upgrade
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Recent Sessions</h2>
                  <button className="btn-primary text-sm">
                    Add New Session
                  </button>
                </div>

                {sessionsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading sessions...</div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">No sleep sessions recorded yet.</div>
                    <button className="btn-primary mt-4">Record Your First Session</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="text-lg font-medium text-gray-900">
                                {new Date(session.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityColor(session.quality)}`}>
                                {getQualityLabel(session.quality)}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Duration: <span className="font-medium">{session.duration}</span>
                            </div>
                            {session.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                Notes: {session.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phase 2 Note */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Phase 2 Features</h3>
                <p className="text-sm text-blue-700">
                  In the next phase, this page will integrate with your actual sleep tracking data from the SleepCoding app, 
                  providing detailed analytics, trends, and insights about your sleep patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 