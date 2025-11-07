'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Session {
  id: number;
  name: string;
  description: string;
  ins_id: string;
  position: number;
}

interface SelectionState {
  session: Session | null;
  instructor: { id: number; name: string; elid: string } | null;
  soundscape: { id: number; name: string; audio_file: string } | null;
}

const STORAGE_KEY = 'sleepcoding_application_selections';

function loadSelections() {
  if (typeof window === 'undefined') {
    return { session: null, instructor: null, soundscape: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading selections:', error);
  }
  return { session: null, instructor: null, soundscape: null };
}

function saveSelections(selections: SelectionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
  } catch (error) {
    console.error('Error saving selections:', error);
  }
}

export default function SessionSelectPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    // Load current selection
    const selections = loadSelections();
    setSelectedSession(selections.session);

    // Check for cached sessions first, then fetch if needed
    const SESSIONS_CACHE_KEY = 'sleepcoding_sessions_cache';
    
    const loadSessionsCache = (): Session[] | null => {
      if (typeof window === 'undefined') return null;
      try {
        const cached = sessionStorage.getItem(SESSIONS_CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error('Error loading sessions cache:', error);
      }
      return null;
    };

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check cache first
        const cached = loadSessionsCache();
        if (cached && cached.length > 0) {
          setSessions(cached);
          setLoading(false);
          return;
        }
        
        // Fetch from API if not cached
        const response = await fetch('/api/sessions');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSessions(data);
        
        // Cache the sessions for future use
        try {
          sessionStorage.setItem(SESSIONS_CACHE_KEY, JSON.stringify(data));
        } catch (err) {
          console.error('Error caching sessions:', err);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [currentUser, router]);

  const handleSessionSelect = (session: Session) => {
    const selections = loadSelections();
    const newSelections = { ...selections, session };
    saveSelections(newSelections);
    setSelectedSession(session);
    // Navigate back to application page
    router.push('/application');
  };

  if (!currentUser) {
    return (
      <main className="bg-[#130a1a] min-h-screen flex items-center justify-center text-white">
        <p>Redirecting to sign in…</p>
      </main>
    );
  }

  return (
    <main className="bg-[#130a1a] text-white min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_#4e88dd_0%,_rgba(19,10,26,0)_60%)]" aria-hidden="true" />
        <div className="relative max-w-md mx-auto px-4 py-8">
          {/* SleepCoding Title */}
          <Link href="/" className="block mb-6">
            <h1 className="text-3xl font-bold text-white hover:text-[#b6e3f6] transition-colors duration-200">
              SleepCoding
            </h1>
          </Link>
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Link 
              href="/application"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-xl font-semibold">Select Session</h2>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center text-gray-400 py-16">
              <p>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <p>No sessions available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedSession?.id === session.id
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <h3 className="text-base font-semibold text-white mb-1">{session.name}</h3>
                  <p className="text-sm text-gray-400">{session.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

