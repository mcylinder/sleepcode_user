'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Soundscape {
  id: number;
  name: string;
  description: string;
  type: 'environment' | 'noise' | 'music';
  audio_file: string;
  position: number;
}

interface SelectionState {
  session: { id: number; name: string; ins_id: string } | null;
  instructor: { id: number; name: string; elid: string } | null;
  soundscape: Soundscape | null;
}

const STORAGE_KEY = 'sleepcoding_application_selections';
const SOUNDSCAPES_CACHE_KEY = 'sleepcoding_soundscapes_cache';
const AUDIO_BASE_URL = 'https://sleepcode-beta.s3.us-east-1.amazonaws.com/soundscapes/';

type SoundscapeType = 'environment' | 'noise' | 'music' | 'all';

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

export default function SoundscapeSelectPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [soundscapes, setSoundscapes] = useState<Soundscape[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [activeTab, setActiveTab] = useState<SoundscapeType>('all');
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement }>({});

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    // Load current selection
    const selections = loadSelections();
    setSelectedSoundscape(selections.soundscape);

    // Check for cached soundscapes first, then fetch if needed
    const loadSoundscapesCache = (): Soundscape[] | null => {
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
    };

    const fetchSoundscapes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check cache first
        const cached = loadSoundscapesCache();
        if (cached && cached.length > 0) {
          setSoundscapes(cached);
          setLoading(false);
          return;
        }
        
        // Fetch from API if not cached
        const response = await fetch('/api/soundscapes');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSoundscapes(data);
        
        // Cache the soundscapes for future use
        try {
          sessionStorage.setItem(SOUNDSCAPES_CACHE_KEY, JSON.stringify(data));
        } catch (err) {
          console.error('Error caching soundscapes:', err);
        }
      } catch (err) {
        console.error('Error fetching soundscapes:', err);
        setError('Failed to load soundscapes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSoundscapes();
  }, [currentUser, router]);

  const handleSoundscapeSelect = (soundscape: Soundscape) => {
    const selections = loadSelections();
    const newSelections = { ...selections, soundscape };
    saveSelections(newSelections);
    setSelectedSoundscape(soundscape);
    // Stop any playing audio
    if (playingAudio !== null && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }
    setPlayingAudio(null);
    // Navigate back to application page
    router.push('/application');
  };

  const handlePlayPreview = (soundscape: Soundscape, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Stop currently playing audio if any
    if (playingAudio !== null && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }

    const soundscapeId = soundscape.id;
    const audio = audioRefs.current[soundscapeId];

    if (audio) {
      if (playingAudio === soundscapeId) {
        // If clicking the same one, pause it
        audio.pause();
        audio.currentTime = 0;
        setPlayingAudio(null);
      } else {
        // Play new audio
        audio.play();
        setPlayingAudio(soundscapeId);
        
        // Handle audio end
        audio.onended = () => {
          setPlayingAudio(null);
        };
      }
    }
  };

  const filteredSoundscapes = activeTab === 'all' 
    ? soundscapes 
    : soundscapes.filter(s => s.type === activeTab);

  if (!currentUser) {
    return (
      <main className="bg-[#130a1a] min-h-screen flex items-center justify-center text-white">
        <p>Redirecting to sign in…</p>
      </main>
    );
  }

  return (
    <main className="bg-[#130a1a] text-white min-h-screen">
      <div className="relative overflow-hidden min-h-screen">
        <div className="fixed inset-0 opacity-50 bg-[radial-gradient(circle_at_top,_#4e88dd_0%,_rgba(19,10,26,0)_60%)] pointer-events-none" aria-hidden="true" />
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
            <h2 className="text-xl font-semibold">Select Soundscape</h2>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-2 border-b border-white/10">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('environment')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'environment'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Environment
            </button>
            <button
              onClick={() => setActiveTab('noise')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'noise'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Noise
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'music'
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Music
            </button>
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
              <p>Loading soundscapes...</p>
            </div>
          ) : filteredSoundscapes.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <p>No soundscapes available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSoundscapes.map((soundscape) => {
                const audioUrl = `${AUDIO_BASE_URL}${soundscape.audio_file}`;
                const isSelected = selectedSoundscape?.id === soundscape.id;
                const isPlaying = playingAudio === soundscape.id;

                return (
                  <div key={soundscape.id}>
                    <div
                      className={`w-full p-4 rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          onClick={() => handleSoundscapeSelect(soundscape)}
                          className="flex-1 text-left"
                        >
                          <h3 className="text-base font-semibold text-white mb-1">{soundscape.name}</h3>
                          <p className="text-sm text-gray-400">{soundscape.description}</p>
                        </button>
                        <button
                          onClick={(e) => handlePlayPreview(soundscape, e)}
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          aria-label={`Play preview for ${soundscape.name}`}
                        >
                          {isPlaying ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Hidden audio element */}
                    <audio
                      ref={(el) => {
                        if (el) audioRefs.current[soundscape.id] = el;
                      }}
                      src={audioUrl}
                      preload="none"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

