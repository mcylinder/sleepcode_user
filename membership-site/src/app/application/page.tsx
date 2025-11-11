'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Session {
  id: number;
  name: string;
  description: string;
  ins_id: string;
  position: number;
}

interface Instructor {
  id: number;
  name: string;
  description: string;
  elid: string;
  audio_preview: string;
  position: number;
}

interface Soundscape {
  id: number;
  name: string;
  description: string;
  type: 'environment' | 'noise' | 'music';
  audio_file: string;
  position: number;
}

interface SelectionState {
  session: Session | null;
  instructor: Instructor | null;
  soundscape: Soundscape | null;
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const handheldMatch = /iphone|ipad|ipod|android|mobile|blackberry|iemobile|kindle/.test(ua);
  const narrowViewport = window.innerWidth <= 820;
  return handheldMatch || (isTouchCapable && narrowViewport);
}

const STORAGE_KEY = 'sleepcoding_application_selections';

function loadSelections(): SelectionState {
  if (typeof window === 'undefined') {
    return { session: null, instructor: null, soundscape: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure instructor is properly typed
      return {
        session: parsed.session || null,
        instructor: parsed.instructor || null,
        soundscape: parsed.soundscape || null,
      };
    }
  } catch (error) {
    console.error('Error loading selections:', error);
  }
  return { session: null, instructor: null, soundscape: null };
}


const DESKTOP_ACK_KEY = 'sleepcoding_desktop_acknowledged';
const SESSIONS_CACHE_KEY = 'sleepcoding_sessions_cache';
const INSTRUCTORS_CACHE_KEY = 'sleepcoding_instructors_cache';
const SOUNDSCAPES_CACHE_KEY = 'sleepcoding_soundscapes_cache';

function loadDesktopAcknowledged(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(DESKTOP_ACK_KEY) === 'true';
  } catch (error) {
    console.error('Error loading desktop acknowledgment:', error);
    return false;
  }
}

function saveDesktopAcknowledged(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DESKTOP_ACK_KEY, 'true');
  } catch (error) {
    console.error('Error saving desktop acknowledgment:', error);
  }
}

function loadSessionsCache(): Session[] | null {
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
}

function saveSessionsCache(sessions: Session[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSIONS_CACHE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions cache:', error);
  }
}

function loadInstructorsCache(): Instructor[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(INSTRUCTORS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error loading instructors cache:', error);
  }
  return null;
}

function saveInstructorsCache(instructors: Instructor[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(INSTRUCTORS_CACHE_KEY, JSON.stringify(instructors));
  } catch (error) {
    console.error('Error saving instructors cache:', error);
  }
}

function loadSoundscapesCache(): Soundscape[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(SOUNDSCAPES_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error loading soundscapes cache:', error);
  }
  return null;
}

function saveSoundscapesCache(soundscapes: Soundscape[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SOUNDSCAPES_CACHE_KEY, JSON.stringify(soundscapes));
  } catch (error) {
    console.error('Error saving soundscapes cache:', error);
  }
}

export default function ApplicationPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [desktopAcknowledged, setDesktopAcknowledged] = useState(false);
  const [selections, setSelections] = useState<SelectionState>({ session: null, instructor: null, soundscape: null });

  // Initialize state after mount to avoid SSR issues
  useEffect(() => {
    setDesktopAcknowledged(loadDesktopAcknowledged());
    setSelections(loadSelections());
  }, []);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateDevice = () => {
      setIsMobile(detectMobile());
    };

    updateDevice();

    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const handlePageShow = () => {
      requestAnimationFrame(resetScroll);
    };

    resetScroll();
    requestAnimationFrame(resetScroll);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load selections from localStorage on mount
    setSelections(loadSelections());
    
    // Refresh selections when page becomes visible (user returns from session page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setSelections(loadSelections());
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Preload sessions and instructors data when user first visits /application
    const preloadData = async () => {
      // Preload sessions
      const cachedSessions = loadSessionsCache();
      if (!cachedSessions || cachedSessions.length === 0) {
        try {
          const sessionsResponse = await fetch('/api/sessions');
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            saveSessionsCache(sessionsData);
          } else {
            console.warn('Failed to preload sessions:', sessionsResponse.status);
          }
        } catch (error) {
          console.error('Error preloading sessions:', error);
        }
      }

      // Preload instructors
      const cachedInstructors = loadInstructorsCache();
      if (!cachedInstructors || cachedInstructors.length === 0) {
        try {
          const instructorsResponse = await fetch('/api/instructors');
          if (instructorsResponse.ok) {
            const instructorsData = await instructorsResponse.json();
            saveInstructorsCache(instructorsData);
          } else {
            console.warn('Failed to preload instructors:', instructorsResponse.status);
          }
        } catch (error) {
          console.error('Error preloading instructors:', error);
        }
      }

      // Preload soundscapes
      const cachedSoundscapes = loadSoundscapesCache();
      if (!cachedSoundscapes || cachedSoundscapes.length === 0) {
        try {
          const soundscapesResponse = await fetch('/api/soundscapes');
          if (soundscapesResponse.ok) {
            const soundscapesData = await soundscapesResponse.json();
            saveSoundscapesCache(soundscapesData);
          } else {
            console.warn('Failed to preload soundscapes:', soundscapesResponse.status);
          }
        } catch (error) {
          console.error('Error preloading soundscapes:', error);
        }
      }
    };

    if (currentUser && (isMobile || desktopAcknowledged)) {
      preloadData();
    }
  }, [currentUser, isMobile, desktopAcknowledged]);

  const allSelected = selections.session && selections.instructor && selections.soundscape;

  if (!currentUser) {
    return (
      <main className="bg-[#ffffff] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <p className="text-center text-gray-600">Redirecting to sign in…</p>
        </div>
      </main>
    );
  }

  if (isMobile === null) {
    return (
      <main className="bg-[#340c35] min-h-screen flex items-center justify-center text-white">
        <p className="text-lg">Preparing your workspace…</p>
      </main>
    );
  }

  if (!isMobile && !desktopAcknowledged) {
    return (
      <main className="min-h-screen bg-[#1f1630] text-white flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-6">
          <h1 className="text-3xl font-semibold">SleepCoding works best on mobile</h1>
          <p className="text-base text-[#d6c9f2]">
            The Application experience is optimized for phones and tablets. For the smoothest experience, switch to a
            mobile device. If you need to continue on desktop, you can still proceed.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setDesktopAcknowledged(true);
                saveDesktopAcknowledged();
              }}
              className="inline-flex items-center justify-center px-6 py-2 bg-[#b6e3f6] text-[#1f1630] font-medium rounded-full shadow-md hover:bg-white transition-colors duration-200"
            >
              Continue on desktop
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#130a1a] text-white min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_#4e88dd_0%,_rgba(19,10,26,0)_60%)]" aria-hidden="true" />
        <div className="relative max-w-md mx-auto px-4 py-8 space-y-4">
          {/* SleepCoding Title */}
          <Link href="/" className="block mb-6">
            <h1 className="text-3xl font-bold text-white hover:text-[#b6e3f6] transition-colors duration-200">
              SleepCoding
            </h1>
          </Link>
          {/* Session Card */}
          <Link
            href="/application/session"
            className="w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div className="flex-1 text-left">
              <h3 className="text-base font-semibold text-white mb-1">Session</h3>
              <p className="text-sm text-gray-400">
                {selections.session ? selections.session.name : 'Select a session'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selections.session && (
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Instructor Card */}
          <Link
            href="/application/instructor"
            className="w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div className="flex-1 text-left">
              <h3 className="text-base font-semibold text-white mb-1">Instructor</h3>
              <p className="text-sm text-gray-400">
                {selections.instructor ? selections.instructor.name : 'Select an instructor'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selections.instructor && (
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Soundscape Card */}
          <Link
            href="/application/soundscape"
            className="w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div className="flex-1 text-left">
              <h3 className="text-base font-semibold text-white mb-1">Soundscape</h3>
              <p className="text-sm text-gray-400">
                {selections.soundscape ? selections.soundscape.name : 'Select a soundscape'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selections.soundscape && (
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Go to Player Button */}
          <Link
            href="/application/player"
            className={`w-full rounded-2xl py-4 px-6 font-semibold text-white transition-opacity text-center block ${
              allSelected
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90'
                : 'bg-gray-600/50 opacity-50 cursor-not-allowed pointer-events-none'
            }`}
          >
            Go to Player
          </Link>
        </div>
      </div>
    </main>
  );
}
