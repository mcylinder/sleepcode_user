'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Instructor {
  id: number;
  name: string;
  description: string;
  elid: string;
  audio_preview: string;
  position: number;
}

interface SelectionState {
  session: { id: number; name: string; ins_id: string } | null;
  instructor: Instructor | null;
  soundscape: { id: number; name: string; audio_file: string } | null;
}

const STORAGE_KEY = 'sleepcoding_application_selections';
const INSTRUCTORS_CACHE_KEY = 'sleepcoding_instructors_cache';
const AUDIO_BASE_URL = 'https://sleepcode-beta.s3.us-east-1.amazonaws.com/';

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

export default function InstructorSelectPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement }>({});

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    // Load current selection
    const selections = loadSelections();
    setSelectedInstructor(selections.instructor);

    // Check for cached instructors first, then fetch if needed
    const loadInstructorsCache = (): Instructor[] | null => {
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
    };

    const fetchInstructors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check cache first
        const cached = loadInstructorsCache();
        if (cached && cached.length > 0) {
          setInstructors(cached);
          setLoading(false);
          return;
        }
        
        // Fetch from API if not cached
        const response = await fetch('/api/instructors');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setInstructors(data);
        
        // Cache the instructors for future use
        try {
          sessionStorage.setItem(INSTRUCTORS_CACHE_KEY, JSON.stringify(data));
        } catch (err) {
          console.error('Error caching instructors:', err);
        }
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError('Failed to load instructors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, [currentUser, router]);

  const handleInstructorSelect = (instructor: Instructor) => {
    const selections = loadSelections();
    const newSelections = { ...selections, instructor };
    saveSelections(newSelections);
    setSelectedInstructor(instructor);
    // Stop any playing audio
    if (playingAudio !== null && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }
    setPlayingAudio(null);
    // Navigate back to application page
    router.push('/application');
  };

  const handlePlayPreview = (instructor: Instructor, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Stop currently playing audio if any
    if (playingAudio !== null && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }

    const instructorId = instructor.id;
    const audio = audioRefs.current[instructorId];

    if (audio) {
      if (playingAudio === instructorId) {
        // If clicking the same one, pause it
        audio.pause();
        audio.currentTime = 0;
        setPlayingAudio(null);
      } else {
        // Play new audio
        audio.play();
        setPlayingAudio(instructorId);
        
        // Handle audio end
        audio.onended = () => {
          setPlayingAudio(null);
        };
      }
    }
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
            <h2 className="text-xl font-semibold">Select Instructor</h2>
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
              <p>Loading instructors...</p>
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <p>No instructors available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instructors.map((instructor) => {
                const audioUrl = `${AUDIO_BASE_URL}${instructor.audio_preview}`;
                const isSelected = selectedInstructor?.id === instructor.id;
                const isPlaying = playingAudio === instructor.id;

                return (
                  <div key={instructor.id}>
                    <div
                      className={`w-full p-4 rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          onClick={() => handleInstructorSelect(instructor)}
                          className="flex-1 text-left"
                        >
                          <h3 className="text-base font-semibold text-white mb-1">{instructor.name}</h3>
                          <p className="text-sm text-gray-400">{instructor.description}</p>
                        </button>
                        <button
                          onClick={(e) => handlePlayPreview(instructor, e)}
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          aria-label={`Play preview for ${instructor.name}`}
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
                        if (el) audioRefs.current[instructor.id] = el;
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

