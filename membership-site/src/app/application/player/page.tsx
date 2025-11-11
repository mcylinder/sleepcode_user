'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Bevan } from 'next/font/google';

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

interface TimestampWrapper {
  timestamps: number[];
}

interface TimestampError {
  error: boolean;
  status?: number;
  message?: string;
}

type TimestampResult = number[] | TimestampWrapper | TimestampError | null;

interface SelectionState {
  session: Session | null;
  instructor: Instructor | null;
  soundscape: Soundscape | null;
}

const bevan = Bevan({
  subsets: ['latin'],
  weight: '400',
});

const STORAGE_KEY = 'sleepcoding_application_selections';

function loadSelections(): SelectionState {
  if (typeof window === 'undefined') {
    return { session: null, instructor: null, soundscape: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
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

function isTimestampWrapper(value: unknown): value is TimestampWrapper {
  return (
    typeof value === 'object' &&
    value !== null &&
    'timestamps' in value &&
    Array.isArray((value as TimestampWrapper).timestamps)
  );
}

function isTimestampError(value: unknown): value is TimestampError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as TimestampError).error === 'boolean'
  );
}

export default function PlayerPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [selections, setSelections] = useState<SelectionState>({ session: null, instructor: null, soundscape: null });
  const [isPlaying, setIsPlaying] = useState(false);
  const [crossfade, setCrossfade] = useState(50); // 0 = instructor, 100 = soundscape
  const [timerMinutes, setTimerMinutes] = useState(120);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isNightShade, setIsNightShade] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [tempTimerMinutes, setTempTimerMinutes] = useState(120);
  const [numSegments, setNumSegments] = useState(1);
  const [rawSegmentsValue, setRawSegmentsValue] = useState(1);
  const [maxSegments, setMaxSegments] = useState(1);
  const [segmentsEnabled, setSegmentsEnabled] = useState(false);
  const [isTimestampLoading, setIsTimestampLoading] = useState(true);
  const [isSoundscapeLoading, setIsSoundscapeLoading] = useState(false);
  
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<{ instructor?: AudioBuffer; soundscape?: AudioBuffer }>({});
  const sourceNodesRef = useRef<{ instructor?: AudioBufferSourceNode; soundscape?: AudioBufferSourceNode }>({});
  const gainNodesRef = useRef<{ instructor?: GainNode; soundscape?: GainNode }>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const instructorTimestampsRef = useRef<number[] | null>(null);
  const loopMonitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loopStartTimeRef = useRef<number | null>(null);
  const loopDurationRef = useRef<number | null>(null);
  const skipIntroNextStartRef = useRef(false);
  const startingRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectionsRef = useRef(selections);
  const timerMinutesRef = useRef(timerMinutes);
  const isPlayingRef = useRef(false);
  const numSegmentsRef = useRef(1);
  const crossfadeRef = useRef(crossfade);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const sliderDraggingRef = useRef(false);

  // Keep refs updated
  useEffect(() => {
    selectionsRef.current = selections;
  }, [selections]);

  useEffect(() => {
    timerMinutesRef.current = timerMinutes;
  }, [timerMinutes]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    numSegmentsRef.current = numSegments;
  }, [numSegments]);

  useEffect(() => {
    crossfadeRef.current = crossfade;
  }, [crossfade]);

  // Analytics tracking function
  const trackAction = async (action: 'play' | 'pause' | 'leave') => {
    try {
      const userId = currentUser?.uid || null;
      const currentSelections = selectionsRef.current;
      const currentTimerMinutes = timerMinutesRef.current;
      
      const instructor = currentSelections.instructor ? {
        id: currentSelections.instructor.id,
        name: currentSelections.instructor.name
      } : null;
      
      const soundscape = currentSelections.soundscape ? {
        id: currentSelections.soundscape.id,
        name: currentSelections.soundscape.name
      } : null;
      
      const instruction = currentSelections.session ? {
        id: currentSelections.session.id,
        ins_id: currentSelections.session.ins_id,
        title: currentSelections.session.name
      } : null;

      const payload = {
        userID: userId,
        instructor,
        soundscape,
        instruction,
        action,
        timerMinutes: currentTimerMinutes,
        intensitySegments: numSegmentsRef.current, // Focus/Immersive slider value (segment count)
        crossfade: crossfadeRef.current // Crossfade slider value (0-100, where 0 = instructor, 100 = soundscape)
      };

      await fetch('/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    const savedSelections = loadSelections();
    
    // Check if we have all required selections
    if (!savedSelections.session || !savedSelections.instructor || !savedSelections.soundscape) {
      setIsTimestampLoading(false);
      router.replace('/application');
      return;
    }

    setSelections(savedSelections);

    // Load saved preferences
    const savedCrossfade = localStorage.getItem('sleepcoding_crossfade');
    if (savedCrossfade) {
      setCrossfade(parseInt(savedCrossfade, 10));
    }

    const savedTimer = localStorage.getItem('sleepcoding_timer');
    if (savedTimer) {
      const timer = parseInt(savedTimer, 10);
      setTimerMinutes(timer);
      setRemainingSeconds(timer * 60);
      setTempTimerMinutes(timer);
    } else {
      setRemainingSeconds(120 * 60);
    }

    const savedSegments = localStorage.getItem('sleepcoding_segments');
    if (savedSegments) {
      const segs = parseInt(savedSegments, 10);
      setNumSegments(segs);
      setRawSegmentsValue(segs);
      numSegmentsRef.current = segs;
    }

    // Load instructor timestamps and preload audio
    if (savedSelections.instructor && savedSelections.session) {
      setSegmentsEnabled(false);
      setIsTimestampLoading(true);
      const instructionId = savedSelections.session.ins_id;
      const instructorId = savedSelections.instructor.elid;
      
      // Use CloudFront domain if available, otherwise fallback to S3
      // Check if we have CloudFront domain from environment (client-side can't access process.env directly)
      // For now, try CloudFront first, then S3
      const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
      const baseUrl = cloudfrontDomain 
        ? `https://${cloudfrontDomain}`
        : 'https://sleepcode-beta.s3.us-east-1.amazonaws.com';
      
      const instructorUrl = `${baseUrl}/instructions/${instructionId}_${instructorId}_2.m4a`;
      // Audio and JSON files always use _2 suffix regardless of session type
      const jsonUrl = `${baseUrl}/instructions/${instructionId}_${instructorId}_2.json`;
      const proxyJsonUrl = `/api/audio/proxy?url=${encodeURIComponent(jsonUrl)}`;

      // Load timestamps
      // Try direct S3 fetch first (like reference code), fallback to proxy if CORS fails
      console.log('Loading timestamps from:', jsonUrl);
      console.log('Full JSON URL:', jsonUrl);
      
      const loadTimestamps = async (): Promise<TimestampResult> => {
        // Try direct fetch first (S3 bucket is publicly accessible)
        try {
          console.log('Attempting direct S3 fetch from:', jsonUrl);
          const directResponse = await fetch(jsonUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            // Don't send credentials or custom headers that might cause issues
            credentials: 'omit',
          });
          
          console.log('Direct fetch response status:', directResponse.status, directResponse.statusText);
          
          if (directResponse.ok) {
            const jsonData: unknown = await directResponse.json();
            console.log('✅ Direct S3 fetch succeeded');
            if (Array.isArray(jsonData) || isTimestampWrapper(jsonData)) {
              return jsonData;
            }
            console.warn('Direct fetch returned unexpected format:', jsonData);
            return null;
          } else {
            console.warn('Direct S3 fetch failed with status:', directResponse.status, 'trying proxy...');
            // Try to read error for debugging
            try {
              const errorText = await directResponse.text();
              console.warn('Direct fetch error response:', errorText.substring(0, 200));
            } catch {
              // Ignore error reading response
            }
          }
        } catch (directError) {
          console.warn('Direct S3 fetch error (likely CORS):', directError);
          console.warn('Error details:', directError instanceof Error ? directError.message : String(directError));
        }
        
        // Fallback to proxy only if direct fetch fails
        console.log('Using proxy fallback:', proxyJsonUrl);
        try {
          const proxyResponse = await fetch(proxyJsonUrl);
          console.log('Proxy response status:', proxyResponse.status, proxyResponse.statusText);
          const contentType = proxyResponse.headers.get('content-type');
          console.log('Proxy response content-type:', contentType);
          
          if (!proxyResponse.ok) {
            const errorText = await proxyResponse.text().catch(() => 'Could not read error');
            console.error('❌ Proxy response not OK:', proxyResponse.status, errorText);
            return { error: true, status: proxyResponse.status, message: errorText };
          }
          
          const data: unknown = await proxyResponse.json();
          
          // Check if proxy returned an error object
          if (isTimestampError(data)) {
            console.error('❌ Proxy returned error:', data.message);
            return data;
          }
          
          if (Array.isArray(data) || isTimestampWrapper(data)) {
            return data;
          }

          console.warn('Proxy fetch returned unexpected format:', data);
          return null;
        } catch (proxyError) {
          console.error('❌ Proxy fetch error:', proxyError);
          return { error: true, message: proxyError instanceof Error ? proxyError.message : String(proxyError) };
        }
      };
      
      loadTimestamps()
        .then(result => {
          // Handle error responses
          if (isTimestampError(result)) {
            console.error('❌ Failed to load timestamps:', result.message || result);
            return;
          }
          
          console.log('Timestamps received:', result);
          console.log('Timestamps type:', typeof result);
          console.log('Is array?', Array.isArray(result));
          
          const timestampsArray = Array.isArray(result)
            ? result
            : isTimestampWrapper(result)
              ? result.timestamps
              : null;
          
          if (timestampsArray) {
            console.log('✅ Timestamps array length:', timestampsArray.length);
            console.log('📋 ALL TIMESTAMP VALUES:', timestampsArray);
            console.log('📋 Timestamps as JSON:', JSON.stringify(timestampsArray, null, 2));
            console.log('First few timestamps:', timestampsArray.slice(0, 5));
            console.log('Last few timestamps:', timestampsArray.slice(-5));
            
            if (timestampsArray.length < 2) {
              console.warn('⚠️ Timestamps array has less than 2 elements:', timestampsArray.length);
            }
            
            instructorTimestampsRef.current = timestampsArray;
            const computedMax = Math.max(1, timestampsArray.length - 1);
            console.log('✅ Computed maxSegments:', computedMax, 'from timestamps.length:', timestampsArray.length);
            console.log('📊 Segment breakdown:');
            console.log('  - Total timestamp entries:', timestampsArray.length);
            console.log('  - Intro ends at index 1:', timestampsArray[1], 'seconds');
            console.log('  - Max segments available:', computedMax);
            console.log('  - Each segment represents one phrase boundary');
            setMaxSegments(computedMax);
            setSegmentsEnabled(true);
            const clamped = Math.min(Math.max(1, numSegmentsRef.current), computedMax);
            setNumSegments(clamped);
            setRawSegmentsValue(clamped);
            numSegmentsRef.current = clamped;
            console.log('✅ Set maxSegments to:', computedMax, 'numSegments to:', clamped);
          } else {
            console.warn('❌ Timestamps is not a valid array:', result);
            if (result !== null) {
              console.warn('Timestamps value:', JSON.stringify(result, null, 2));
            }
          }
        })
        .catch(error => {
          console.error('❌ Error loading instructor timestamps:', error);
          console.error('Error stack:', error.stack);
        })
        .finally(() => {
          setIsTimestampLoading(false);
        });

      // Preload instructor audio
      loadAudioBuffer(instructorUrl)
        .then(buffer => {
          audioBuffersRef.current.instructor = buffer;
        })
        .catch(error => {
          console.error('Error preloading instructor audio:', error);
        });
    }

    // Preload soundscape audio
    if (savedSelections.soundscape && savedSelections.soundscape.audio_file) {
      const soundscapeUrl = `https://sleepcode-beta.s3.us-east-1.amazonaws.com/soundscapes/${savedSelections.soundscape.audio_file}`;
      setIsSoundscapeLoading(true);
      loadAudioBuffer(soundscapeUrl)
        .then(buffer => {
          audioBuffersRef.current.soundscape = buffer;
          setIsSoundscapeLoading(false);
        })
        .catch(error => {
          console.error('Error preloading soundscape audio:', error);
          setIsSoundscapeLoading(false);
        });
    }

    // Track page leave/unload with sendBeacon for reliability
    const handleBeforeUnload = () => {
      const userId = currentUser?.uid || null;
      const currentSelections = selectionsRef.current;
      const currentTimerMinutes = timerMinutesRef.current;
      
      const soundscape = currentSelections.soundscape ? {
        id: currentSelections.soundscape.id,
        name: currentSelections.soundscape.name
      } : null;
      
      const instruction = currentSelections.session ? {
        id: currentSelections.session.id,
        ins_id: currentSelections.session.ins_id,
        title: currentSelections.session.name
      } : null;

      const payload = JSON.stringify({
        userID: userId,
        soundscape,
        instruction,
        action: 'leave',
        timerMinutes: currentTimerMinutes
      });

      // Use sendBeacon for reliable tracking during page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/action', new Blob([payload], { type: 'application/json' }));
      } else {
        // Fallback for browsers without sendBeacon
        fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    const videoElement = videoRef.current;
    
    return () => {
      stopAllAudio();
      releaseWakeLock();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      // Capture video ref at cleanup time to avoid stale closure warning
      if (videoElement) {
        videoElement.pause();
      }
      // Track leave on component unmount
      trackAction('leave');
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, router]);

  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const loadAudioBuffer = async (url: string): Promise<AudioBuffer> => {
    // Proxy S3 URLs through our API to avoid CORS issues
    const proxyUrl = url.startsWith('https://sleepcode-beta.s3.us-east-1.amazonaws.com/')
      ? `/api/audio/proxy?url=${encodeURIComponent(url)}`
      : url;

    try {
      const response = await fetch(proxyUrl, {
        credentials: 'omit'
      });
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const ctx = ensureAudioContext();
      return await ctx.decodeAudioData(arrayBuffer);
    } catch (fetchError) {
      console.error('Error loading audio buffer:', fetchError);
      throw fetchError;
    }
  };

  const stopAllAudio = () => {
    if (loopMonitorIntervalRef.current) {
      clearInterval(loopMonitorIntervalRef.current);
      loopMonitorIntervalRef.current = null;
    }
    loopStartTimeRef.current = null;
    loopDurationRef.current = null;

    Object.entries(sourceNodesRef.current).forEach(([, source]) => {
      try {
        if (source && typeof source.stop === 'function') {
          source.stop(0);
        }
      } catch {
        // Ignore errors from already stopped sources
      }
      try {
        if (source && typeof source.disconnect === 'function') {
          source.disconnect();
        }
      } catch {
        // Ignore disconnect errors
      }
    });
    sourceNodesRef.current = {};

    Object.entries(gainNodesRef.current).forEach(([, gain]) => {
      try {
        if (gain && typeof gain.disconnect === 'function') {
          gain.disconnect();
        }
      } catch {
        // Ignore disconnect errors
      }
    });
    gainNodesRef.current = {};
  };

  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock;
        wakeLockRef.current = await wakeLock.request('screen');
        console.log('Wake lock acquired');
      }
    } catch (err) {
      console.warn('Wake lock request failed:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          stopPlayback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const resetTimer = () => {
    setRemainingSeconds(timerMinutes * 60);
  };

  // Apply rounding/clamping for segments
  useEffect(() => {
    if (!segmentsEnabled) return;
    const maxSeg = maxSegments;
    const clampedRaw = Math.max(1, Math.min(rawSegmentsValue, maxSeg));
    const rounded = Math.max(1, Math.min(Math.round(clampedRaw), maxSeg));
    if (rounded !== numSegments) {
      setNumSegments(rounded);
      numSegmentsRef.current = rounded;
      localStorage.setItem('sleepcoding_segments', rounded.toString());
      if (isPlaying) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }
        stopPlayback();
        skipIntroNextStartRef.current = true;
        restartTimeoutRef.current = setTimeout(() => {
          restartTimeoutRef.current = null;
          startPlayback();
        }, 80);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSegmentsValue, maxSegments, segmentsEnabled, isPlaying]);

  const buildLoopingWindowSource = (windowStartSeconds: number, windowEndSeconds: number, instructorBuffer: AudioBuffer, instructorVolume: number) => {
    if (windowEndSeconds <= windowStartSeconds) {
      console.error(`Invalid loop window: start=${windowStartSeconds}, end=${windowEndSeconds}`);
      return;
    }

    if (sourceNodesRef.current.instructor) {
      try {
        (sourceNodesRef.current.instructor as AudioBufferSourceNode).stop(0);
      } catch {
        // Ignore errors from already stopped sources
      }
      try {
        (sourceNodesRef.current.instructor as AudioBufferSourceNode).disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }
    if (gainNodesRef.current.instructor) {
      try {
        (gainNodesRef.current.instructor as GainNode).disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }

    sourceNodesRef.current.instructor = undefined;
    gainNodesRef.current.instructor = undefined;

    const ctxLocal = ensureAudioContext();
    const sampleRate = instructorBuffer.sampleRate;
    const channels = instructorBuffer.numberOfChannels;
    
    // Convert timestamps (seconds) to exact sample indices
    // AudioBuffer is already decoded at its native sample rate (e.g., 44.1 kHz)
    // We copy samples sample-for-sample, so timing stays accurate
    const startSample = Math.max(0, Math.floor(windowStartSeconds * sampleRate));
    const endSample = Math.min(instructorBuffer.length, Math.floor(windowEndSeconds * sampleRate));
    const newLength = Math.max(0, endSample - startSample);
    
    // Calculate actual time boundaries from sample indices
    const actualStartTime = startSample / sampleRate;
    const actualEndTime = endSample / sampleRate;
    const actualDuration = actualEndTime - actualStartTime;
    
    console.log(`🔧 Building loop window: [${windowStartSeconds.toFixed(3)}s → ${windowEndSeconds.toFixed(3)}s]`);
    console.log(`   Sample rate: ${sampleRate} Hz`);
    console.log(`   Start sample: ${startSample} (actual: ${actualStartTime.toFixed(3)}s)`);
    console.log(`   End sample: ${endSample} (actual: ${actualEndTime.toFixed(3)}s)`);
    console.log(`   Window length: ${newLength} samples (${actualDuration.toFixed(3)}s)`);
    console.log(`   ⚠️ Time difference: requested end ${windowEndSeconds.toFixed(3)}s vs actual ${actualEndTime.toFixed(3)}s (diff: ${(actualEndTime - windowEndSeconds).toFixed(3)}s)`);
    
    const trimmedBuffer = ctxLocal.createBuffer(channels, newLength, sampleRate);
    
    // Copy samples sample-for-sample from original buffer
    // This preserves exact timing since we're not resampling
    for (let channel = 0; channel < channels; channel++) {
      const originalData = instructorBuffer.getChannelData(channel);
      const newData = trimmedBuffer.getChannelData(channel);
      for (let i = 0; i < newLength; i++) {
        newData[i] = originalData[i + startSample];
      }
    }

    const loopingSource = ctxLocal.createBufferSource();
    loopingSource.buffer = trimmedBuffer;
    loopingSource.loop = true;
    const loopingGain = ctxLocal.createGain();
    loopingGain.gain.value = instructorVolume;
    loopingSource.connect(loopingGain);
    loopingGain.connect(ctxLocal.destination);
    
    const loopDurationSeconds = trimmedBuffer.duration;
    loopDurationRef.current = loopDurationSeconds;
    loopStartTimeRef.current = ctxLocal.currentTime;
    loopingSource.start(0);

    if (loopMonitorIntervalRef.current) {
      clearInterval(loopMonitorIntervalRef.current);
    }

    sourceNodesRef.current.instructor = loopingSource;
    gainNodesRef.current.instructor = loopingGain;
  };

  const computeLoopEnd = (timestamps: number[] | null, instructorBuffer: AudioBuffer): number => {
    if (timestamps && timestamps.length > 1) {
      const maxSegments = Math.max(1, timestamps.length - 1);
      const segmentsToUse = Math.min(Math.max(1, numSegmentsRef.current), maxSegments);
      const candidateIndex = segmentsToUse + 1;
      const boundaryTimestamp = timestamps[candidateIndex];
      
      console.log(`🔍 computeLoopEnd: segmentsToUse=${segmentsToUse}, candidateIndex=${candidateIndex}`);
      console.log(`   timestamps[${candidateIndex}] = ${boundaryTimestamp}s`);
      if (candidateIndex > 0) {
        console.log(`   Previous timestamp[${candidateIndex - 1}] = ${timestamps[candidateIndex - 1]}s`);
        console.log(`   Gap to next boundary: ${boundaryTimestamp - timestamps[candidateIndex - 1]}s`);
      }
      if (candidateIndex < timestamps.length - 1) {
        console.log(`   Next timestamp[${candidateIndex + 1}] = ${timestamps[candidateIndex + 1]}s`);
        console.log(`   Gap after boundary: ${timestamps[candidateIndex + 1] - boundaryTimestamp}s`);
      }
      
      if (typeof boundaryTimestamp === 'number') {
        // The timestamp marks a phrase boundary - it's where the current segment ENDS
        // and the next segment STARTS. To avoid hearing the start of the next segment,
        // we need to stop slightly before this boundary.
        // Calculate a safe offset: use a small fraction of the current segment gap,
        // or a fixed small amount (e.g., 0.75s as suggested), whichever is smaller
        const gapFromPrev = candidateIndex > 0 
          ? boundaryTimestamp - timestamps[candidateIndex - 1]
          : boundaryTimestamp;
        
        // Use a small offset: either 0.75s or 5% of the current segment gap, whichever is smaller
        // This ensures we don't cut off too much, but also don't include the next segment
        const offsetSeconds = Math.min(0.75, gapFromPrev * 0.05);
        const loopEnd = Math.max(
          timestamps[candidateIndex - 1] || 0, // Don't go before previous boundary
          boundaryTimestamp - offsetSeconds
        );
        
        console.log(`   Boundary timestamp: ${boundaryTimestamp}s`);
        console.log(`   Gap from previous: ${gapFromPrev.toFixed(3)}s`);
        console.log(`   Calculated offset: ${offsetSeconds.toFixed(3)}s`);
        console.log(`   ✅ Using loop end: ${loopEnd.toFixed(3)}s (${(boundaryTimestamp - loopEnd).toFixed(3)}s before boundary)`);
        return loopEnd;
      }
      return instructorBuffer.duration;
    }
    return instructorBuffer.duration;
  };

  const startPlayback = async () => {
    if (startingRef.current) return;
    startingRef.current = true;

    try {
      stopAllAudio();
      if (loopMonitorIntervalRef.current) {
        clearInterval(loopMonitorIntervalRef.current);
        loopMonitorIntervalRef.current = null;
      }
      loopStartTimeRef.current = null;
      loopDurationRef.current = null;

      if (videoRef.current) {
        videoRef.current.play().catch(err => console.error('Video play error:', err));
      }

      const ctx = ensureAudioContext();
      const instructorVolume = (100 - crossfade) / 100;
      const soundscapeVolume = crossfade / 100;

      // Play instructor audio
      if (selections.instructor && selections.session) {
        const instructionId = selections.session.ins_id;
        const instructorId = selections.instructor.elid;
        
        // Use CloudFront domain if available, otherwise fallback to S3
        const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
        const baseUrl = cloudfrontDomain 
          ? `https://${cloudfrontDomain}`
          : 'https://sleepcode-beta.s3.us-east-1.amazonaws.com';
        
        const instructorUrl = `${baseUrl}/instructions/${instructionId}_${instructorId}_2.m4a`;

        // Load timestamps if not already loaded (fallback for startPlayback)
        let timestamps = instructorTimestampsRef.current;
        if (!timestamps) {
          setIsTimestampLoading(true);
          // Audio/JSON files always use _2 suffix
          const jsonUrl = `${baseUrl}/instructions/${instructionId}_${instructorId}_2.json`;
          const proxyJsonUrl = `/api/audio/proxy?url=${encodeURIComponent(jsonUrl)}`;
          console.log('Loading timestamps in startPlayback from:', proxyJsonUrl);
          try {
            const jsonResponse = await fetch(proxyJsonUrl);
            console.log('Timestamps response in startPlayback:', jsonResponse.status, jsonResponse.statusText);
            if (jsonResponse.ok) {
              const jsonData: unknown = await jsonResponse.json();
              console.log('Timestamps loaded in startPlayback:', jsonData);
              console.log('Timestamps type:', typeof jsonData);
              console.log('Is array?', Array.isArray(jsonData));
              console.log('Length:', (jsonData as { length?: number })?.length);
              if (Array.isArray(jsonData)) {
                timestamps = jsonData;
                console.log('✅ Timestamps loaded in startPlayback');
                console.log('📋 ALL TIMESTAMP VALUES:', jsonData);
                console.log('📋 Timestamps as JSON:', JSON.stringify(jsonData, null, 2));
                console.log('First few timestamps:', jsonData.slice(0, 5));
                console.log('Last few timestamps:', jsonData.slice(-5));
                instructorTimestampsRef.current = jsonData;
                const computedMax = Math.max(1, jsonData.length - 1);
                console.log('📊 Segment breakdown:');
                console.log('  - Total timestamp entries:', jsonData.length);
                console.log('  - Intro ends at index 1:', jsonData[1], 'seconds');
                console.log('  - Max segments available:', computedMax);
                console.log('Setting maxSegments to:', computedMax, 'from timestamps.length:', jsonData.length);
                setMaxSegments(computedMax);
                setSegmentsEnabled(true);
                const clamped = Math.min(Math.max(1, numSegmentsRef.current), computedMax);
                setNumSegments(clamped);
                setRawSegmentsValue(clamped);
                numSegmentsRef.current = clamped;
              } else if (isTimestampWrapper(jsonData)) {
                const tsArray = jsonData.timestamps;
                timestamps = tsArray;
                console.log('Found timestamps in object property in startPlayback');
                instructorTimestampsRef.current = tsArray;
                const computedMax = Math.max(1, tsArray.length - 1);
                setMaxSegments(computedMax);
                setSegmentsEnabled(true);
                const clamped = Math.min(Math.max(1, numSegmentsRef.current), computedMax);
                setNumSegments(clamped);
                setRawSegmentsValue(clamped);
                numSegmentsRef.current = clamped;
              } else if (isTimestampError(jsonData)) {
                console.warn('Timestamp error object in startPlayback:', jsonData.message);
              } else {
                console.warn('Timestamps is not a valid array in startPlayback:', jsonData);
                console.warn('Timestamps value:', JSON.stringify(jsonData, null, 2));
              }
            } else {
              const errorText = await jsonResponse.text().catch(() => 'Could not read error');
              console.warn('Timestamps response not OK in startPlayback:', jsonResponse.status, errorText);
            }
          } catch (error) {
            console.error('Error loading instructor timestamps in startPlayback:', error);
          } finally {
            setIsTimestampLoading(false);
          }
        } else {
          console.log('Timestamps already loaded:', timestamps, 'length:', timestamps.length, 'maxSegments should be:', Math.max(1, timestamps.length - 1));
        }

        let instructorBuffer = audioBuffersRef.current.instructor;
        if (!instructorBuffer) {
          instructorBuffer = await loadAudioBuffer(instructorUrl);
          audioBuffersRef.current.instructor = instructorBuffer;
        }

        // Re-read timestamps after potential load
        timestamps = instructorTimestampsRef.current;
        const introEnd = timestamps && timestamps.length > 1 ? timestamps[1] : 10;
        const loopEnd = computeLoopEnd(timestamps, instructorBuffer);

        if (skipIntroNextStartRef.current) {
          skipIntroNextStartRef.current = false;
          buildLoopingWindowSource(introEnd, loopEnd, instructorBuffer, instructorVolume);
        } else {
          if (sourceNodesRef.current.instructor) {
            try {
              (sourceNodesRef.current.instructor as AudioBufferSourceNode).stop(0);
              (sourceNodesRef.current.instructor as AudioBufferSourceNode).disconnect();
            } catch {
              // Ignore errors from already stopped sources
            }
          }
          if (gainNodesRef.current.instructor) {
            try {
              (gainNodesRef.current.instructor as GainNode).disconnect();
            } catch {
              // Ignore disconnect errors
            }
          }

          const instructorSource = ctx.createBufferSource();
          instructorSource.buffer = instructorBuffer;
          instructorSource.loop = false;
          const instructorGain = ctx.createGain();
          instructorGain.gain.value = instructorVolume;
          instructorSource.connect(instructorGain);
          instructorGain.connect(ctx.destination);

          // Play intro: start at offset 0, play for introEnd seconds
          // This uses the buffer's native sample rate, so timing is sample-accurate
          console.log(`🎵 Playing intro: 0s → ${introEnd.toFixed(3)}s (${Math.floor(introEnd * instructorBuffer.sampleRate)} samples)`);
          instructorSource.start(0, 0, introEnd);

          let introEndedFired = false;
          instructorSource.onended = () => {
            if (introEndedFired) return;
            introEndedFired = true;

            const currentLoopEnd = computeLoopEnd(timestamps, instructorBuffer);
            console.log(`🔄 Intro ended, starting loop: [${introEnd.toFixed(3)}s → ${currentLoopEnd.toFixed(3)}s]`);
            if (isPlayingRef.current && sourceNodesRef.current.instructor === instructorSource) {
              buildLoopingWindowSource(introEnd, currentLoopEnd, instructorBuffer, instructorVolume);
            }
          };
          sourceNodesRef.current.instructor = instructorSource;
          gainNodesRef.current.instructor = instructorGain;
        }
      }

      // Play soundscape audio
      if (selections.soundscape && selections.soundscape.audio_file) {
        if (sourceNodesRef.current.soundscape) {
          try {
            (sourceNodesRef.current.soundscape as AudioBufferSourceNode).stop(0);
            (sourceNodesRef.current.soundscape as AudioBufferSourceNode).disconnect();
          } catch {
            // Ignore errors from already stopped sources
          }
        }
        if (gainNodesRef.current.soundscape) {
          try {
            (gainNodesRef.current.soundscape as GainNode).disconnect();
          } catch {
            // Ignore disconnect errors
          }
        }

        const soundscapeUrl = `https://sleepcode-beta.s3.us-east-1.amazonaws.com/soundscapes/${selections.soundscape.audio_file}`;
        let soundscapeBuffer = audioBuffersRef.current.soundscape;
        if (!soundscapeBuffer) {
          setIsSoundscapeLoading(true);
          soundscapeBuffer = await loadAudioBuffer(soundscapeUrl);
          audioBuffersRef.current.soundscape = soundscapeBuffer;
          setIsSoundscapeLoading(false);
        }

        const soundscapeSource = ctx.createBufferSource();
        soundscapeSource.buffer = soundscapeBuffer;
        soundscapeSource.loop = true;
        const soundscapeGain = ctx.createGain();
        soundscapeGain.gain.value = soundscapeVolume;
        soundscapeSource.connect(soundscapeGain);
        soundscapeGain.connect(ctx.destination);
        soundscapeSource.start(0);

        sourceNodesRef.current.soundscape = soundscapeSource;
        gainNodesRef.current.soundscape = soundscapeGain;
      }

      setIsPlaying(true);
      isPlayingRef.current = true;
      if (remainingSeconds <= 0) {
        resetTimer();
      }
      startTimer();
      await acquireWakeLock();
      trackAction('play');
    } catch (error) {
      console.error('Error starting playback:', error);
      alert('Failed to start audio playback. Please check that audio files are available.');
    } finally {
      startingRef.current = false;
    }
  };

  const stopPlayback = () => {
    stopAllAudio();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsSoundscapeLoading(false);
    pauseTimer();
    releaseWakeLock();

    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    trackAction('pause');
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleCrossfadeChange = (value: number) => {
    setCrossfade(value);
    localStorage.setItem('sleepcoding_crossfade', value.toString());

    if (isPlaying) {
      const instructorVolume = (100 - value) / 100;
      const soundscapeVolume = value / 100;

      if (gainNodesRef.current.instructor) {
        gainNodesRef.current.instructor.gain.value = instructorVolume;
      }
      if (gainNodesRef.current.soundscape) {
        gainNodesRef.current.soundscape.gain.value = soundscapeVolume;
      }
    }
  };

  const handleTimerChange = (minutes: number) => {
    setTimerMinutes(minutes);
    localStorage.setItem('sleepcoding_timer', minutes.toString());

    if (!isTimerRunning) {
      setRemainingSeconds(minutes * 60);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleNightShade = () => {
    setIsNightShade(!isNightShade);
  };

  // Derived intensity color for content description
  const intensityFrac = Math.max(0, Math.min(1,
    (Math.max(1, Math.min(rawSegmentsValue, Math.max(1, maxSegments))) - 1) /
    (Math.max(1, maxSegments) - 1 || 1)
  ));
  const intensityHue = 150 + 50 * intensityFrac; // greenish -> blueish
  const intensityColor = `hsl(${intensityHue}, 90%, 50%)`;

  // Format session description
  const sessionDescription = selections.instructor && selections.session && selections.soundscape
    ? `${selections.instructor.name} reading "${selections.session.name}" over the sound of "${selections.soundscape.name}."`
    : '';

  if (!currentUser) {
    return (
      <main className="bg-[#130a1a] min-h-screen flex items-center justify-center text-white">
        <p>Redirecting to sign in…</p>
      </main>
    );
  }

  if (!selections.session || !selections.instructor || !selections.soundscape) {
    return (
      <main className="bg-[#130a1a] min-h-screen flex items-center justify-center text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 relative" style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Background blur video */}
      <video
        className="fixed inset-0 w-full h-full object-cover opacity-70 pointer-events-none z-0"
        src="/assets/blur.mp4"
        autoPlay
        muted
        loop
        playsInline
        onError={(e) => {
          console.warn('Background video failed to load, continuing without it');
          (e.target as HTMLVideoElement).style.display = 'none';
        }}
      />

      {/* Night Shade Overlay */}
      {isNightShade && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-end justify-center pb-8"
          onClick={toggleNightShade}
        >
          <p className="text-sm text-gray-500">Tap anywhere to exit</p>
        </div>
      )}

      <div className="relative z-10 px-4 py-6">
        {/* Header with back button */}
        <Link
          href="/application"
          className="mb-8 inline-flex items-center text-white"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>

        {/* Session Description */}
        {sessionDescription && (
          <div className="text-center mb-8 px-2">
            <p
              className={bevan.className}
              style={{
                fontWeight: '600',
                fontSize: 23,
                color: intensityColor,
                textAlign: 'center'
              }}
            >
              {sessionDescription}
            </p>
          </div>
        )}

        {/* Focus/Immersive Intensity Slider */}
        <div className="mb-10">
          <div
            className={`${!segmentsEnabled && !isTimestampLoading ? 'opacity-50 pointer-events-none' : ''} flex items-center justify-center`}
            style={{ height: 100 }}
          >
            {isTimestampLoading ? (
              <div className="flex flex-col items-center gap-3 text-gray-200">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                <span className="text-sm font-medium tracking-wide">Loading intensity segments…</span>
              </div>
            ) : (() => {
              const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
                if (!segmentsEnabled) return;
                if (e.preventDefault) e.preventDefault();
                const el = sliderTrackRef.current;
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const value = Math.max(1, Math.min(rawSegmentsValue, Math.max(1, maxSegments)));
                const frac = (Math.max(1, maxSegments) > 1) ? (value - 1) / (Math.max(1, maxSegments) - 1) : 0;
                const handleX = rect.left + frac * rect.width;
                const ex = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX;
                const ey = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY;
                if (typeof ex !== 'number' || typeof ey !== 'number') return;
                const dist = Math.abs(ex - handleX);
                const hit = 26;
                if (dist > hit) return;
                sliderDraggingRef.current = true;
                
                const move = (ev: PointerEvent | TouchEvent) => {
                  if (!sliderDraggingRef.current) return;
                  if (ev.preventDefault) ev.preventDefault();
                  const x = 'clientX' in ev ? ev.clientX : ev.touches?.[0]?.clientX;
                  if (typeof x !== 'number') return;
                  const rel = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
                  const raw = 1 + rel * (Math.max(1, maxSegments) - 1);
                  setRawSegmentsValue(raw);
                };
                
                const up = () => {
                  sliderDraggingRef.current = false;
                  window.removeEventListener('pointermove', move);
                  window.removeEventListener('pointerup', up);
                  window.removeEventListener('touchmove', move);
                  window.removeEventListener('touchend', up);
                };
                
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                window.addEventListener('touchmove', move, { passive: false });
                window.addEventListener('touchend', up);
              };

              const frac = (Math.max(1, maxSegments) > 1)
                ? (Math.max(1, Math.min(rawSegmentsValue, Math.max(1, maxSegments))) - 1) / (Math.max(1, maxSegments) - 1)
                : 0;
              const pct = `${(frac * 100).toFixed(2)}%`;
              const handleSize = 45;
              const halo = 14;
              const hue = 150 + 50 * frac;
              const handleBg = `hsl(${hue}, 90%, 50%)`;
              const handleBorder = `hsl(${hue}, 100%, 85%)`;
              const handleGlow = `0 0 ${halo}px hsla(${hue}, 100%, 60%, 0.6)`;
              const maxAvailable = Math.max(1, maxSegments);
              const currentSegment = Math.max(1, Math.min(Math.round(rawSegmentsValue), maxAvailable));
              const totalSegments = maxAvailable;
              const canDecreaseIntensity = segmentsEnabled && !isTimestampLoading && currentSegment > 1;
              const canIncreaseIntensity = segmentsEnabled && !isTimestampLoading && currentSegment < maxAvailable;
              const adjustSegments = (delta: number) => {
                if (!segmentsEnabled || isTimestampLoading) return;
                const next = Math.max(1, Math.min(maxAvailable, currentSegment + delta));
                if (next !== currentSegment) {
                  setRawSegmentsValue(next);
                }
              };

              return (
                <div className="w-full px-6 flex flex-col items-center">
                  <div className="relative h-8 w-full max-w-[800px]" style={{ touchAction: 'none' }} onPointerDown={handlePointerDown} onTouchStart={handlePointerDown}>
                    <div ref={sliderTrackRef} className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-gray-400/60">
                      {Array.from({ length: Math.max(1, maxSegments) }, (_, i) => {
                        const segNum = i + 1;
                        const tickFrac = maxSegments > 1 ? (segNum - 1) / (maxSegments - 1) : 0;
                        const tickLeft = `${(tickFrac * 100).toFixed(2)}%`;
                        return (
                          <div
                            key={segNum}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-3 bg-gray-500/40"
                            style={{ left: tickLeft }}
                          />
                        );
                      })}
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
                         style={{ left: pct, width: handleSize, height: handleSize, background: handleBg, border: `2px solid ${handleBorder}`, boxShadow: handleGlow }} />
                  </div>
                  <div className="mt-2 text-white text-center">
                    <span className="text-sm font-mono">{`${currentSegment} of ${totalSegments}`}</span>
                  </div>
              <div className="mt-3 flex justify-between w-full max-w-[800px]">
                <button
                  type="button"
                  onClick={() => adjustSegments(-1)}
                  disabled={!canDecreaseIntensity}
                  className="px-4 py-1.5 text-sm font-medium text-gray-200 rounded-md border border-gray-400/40 bg-transparent transition-colors hover:border-gray-200/60 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Decrease intensity toward Focus"
                >
                  Focus
                </button>
                <button
                  type="button"
                  onClick={() => adjustSegments(1)}
                  disabled={!canIncreaseIntensity}
                  className="px-4 py-1.5 text-sm font-medium text-gray-200 rounded-md border border-gray-400/40 bg-transparent transition-colors hover:border-gray-200/60 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Increase intensity toward Immersive"
                >
                  Immersive
                </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Play Button - Large Circular with Video Background */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handlePlayPause}
            className="w-32 h-32 rounded-full overflow-hidden relative transition-transform active:scale-[0.98]"
            style={{
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
            }}
          >
            <video
              ref={videoRef}
              src="/assets/audition.mp4"
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                console.warn('Play button video failed to load');
                (e.target as HTMLVideoElement).style.display = 'none';
              }}
            />
            {/* Play/Pause icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              {isPlaying ? (
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="4" height="12" />
                  <rect x="14" y="6" width="4" height="12" />
                </svg>
              ) : (
                <svg className="w-16 h-16 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Timer and Night Shade Buttons */}
        <div className="flex justify-center mb-8 gap-3">
          <button
            onClick={() => {
              if (!isPlaying) {
                setTempTimerMinutes(timerMinutes);
                setShowTimerModal(true);
              }
            }}
            disabled={isPlaying}
            className="px-6 py-2 rounded-lg border border-cyan-400/30 bg-transparent flex items-center gap-2 text-white disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-cyan-300">{formatTime(remainingSeconds)}</span>
          </button>
          <button
            onClick={toggleNightShade}
            className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center shadow-lg"
            aria-label="Night shade"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              {isNightShade ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Timer Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowTimerModal(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Set Timer</h3>

            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg p-4 overflow-hidden">
                <div className="flex justify-center">
                  <div className="relative">
                    <select
                      value={tempTimerMinutes}
                      onChange={(e) => setTempTimerMinutes(parseInt(e.target.value, 10))}
                      className="bg-transparent text-white text-2xl font-mono text-center appearance-none pr-8 focus:outline-none"
                      style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27white%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right center',
                        backgroundSize: '20px'
                      }}
                    >
                      {Array.from({ length: 40 }, (_, i) => {
                        const minutes = (i + 1) * 15;
                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        const display = hours > 0 && mins > 0
                          ? `${hours}h ${mins}m`
                          : hours > 0
                          ? `${hours}h`
                          : `${mins}m`;
                        return (
                          <option key={minutes} value={minutes}>
                            {display}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTimerModal(false)}
                className="flex-1 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleTimerChange(tempTimerMinutes);
                  setShowTimerModal(false);
                }}
                className="flex-1 py-3 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-colors"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crossfade Control (Volume Blend) */}
      {selections.instructor && selections.soundscape && (
        <div className="relative z-10 px-4 pb-10">
          <CrossfadeControl
            crossfadeValue={crossfade}
            onCrossfadeChange={handleCrossfadeChange}
            instructorName={selections.instructor.name}
            soundscapeName={selections.soundscape.name}
            isSoundscapeLoading={isSoundscapeLoading}
          />
        </div>
      )}
    </main>
  );
}

// CrossfadeControl Component
function CrossfadeControl({ 
  crossfadeValue, 
  onCrossfadeChange, 
  instructorName, 
  soundscapeName, 
  isSoundscapeLoading = false 
}: {
  crossfadeValue: number;
  onCrossfadeChange: (value: number) => void;
  instructorName: string;
  soundscapeName: string;
  isSoundscapeLoading?: boolean;
}) {
  // instructorName and soundscapeName are kept in the interface for future use
  // but are not currently displayed in the UI
  void instructorName;
  void soundscapeName;
  const instructorVolume = 100 - crossfadeValue;
  const soundscapeVolume = crossfadeValue;
  const toOpacity = (pct: number) => 0.3 + 0.7 * (pct / 100);
  const leftOpacity = toOpacity(instructorVolume);
  const rightOpacity = toOpacity(soundscapeVolume);

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    if (e.preventDefault) e.preventDefault();
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = crossfadeValue / 100;
    const handleX = rect.left + frac * rect.width;
    const ex = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX;
    const ey = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY;
    if (typeof ex !== 'number' || typeof ey !== 'number') return;
    const dist = Math.abs(ex - handleX);
    const hit = 26;
    if (dist > hit) return;
    draggingRef.current = true;

    const move = (ev: PointerEvent | TouchEvent) => {
      if (!draggingRef.current) return;
      if (ev.preventDefault) ev.preventDefault();
      const x = 'clientX' in ev ? ev.clientX : ev.touches?.[0]?.clientX;
      if (typeof x !== 'number') return;
      const rel = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      const newValue = Math.round(rel * 100);
      onCrossfadeChange(newValue);
    };

    const up = () => {
      draggingRef.current = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  };

  const frac = crossfadeValue / 100;
  const pct = `${(frac * 100).toFixed(2)}%`;
  const handleSize = 45;
  const halo = 14;
  const handleBg = `hsl(0, 0%, 70%)`;
  const handleBorder = `hsl(0, 0%, 90%)`;
  const handleGlow = `0 0 ${halo}px hsla(0, 0%, 80%, 0.6)`;
  const crossfadeStep = 1;
  const adjustCrossfade = (delta: number) => {
    const target = Math.min(100, Math.max(0, Math.round(crossfadeValue + delta)));
    if (target !== crossfadeValue) {
      onCrossfadeChange(target);
    }
  };
  const canDecrease = crossfadeValue > 0;
  const canIncrease = crossfadeValue < 100;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3 w-full px-4 max-w-[800px]">
        <button
          type="button"
          onClick={() => adjustCrossfade(-crossfadeStep)}
          disabled={!canDecrease}
          className="relative w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-full border border-gray-400/40 bg-transparent text-white transition-colors hover:border-gray-200/60 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ opacity: leftOpacity }}
          aria-label="Increase instructor volume"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <div className="flex-1 relative h-8" style={{ touchAction: 'none' }} onPointerDown={handlePointerDown} onTouchStart={handlePointerDown}>
          <div ref={trackRef} className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-gray-400/60"></div>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
               style={{ left: pct, width: handleSize, height: handleSize, background: handleBg, border: `2px solid ${handleBorder}`, boxShadow: handleGlow }} />
        </div>

        <button
          type="button"
          onClick={() => adjustCrossfade(crossfadeStep)}
          disabled={!canIncrease}
          className="relative w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-full border border-gray-400/40 bg-transparent text-white transition-colors hover:border-gray-200/60 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ opacity: rightOpacity }}
          aria-label="Increase soundscape volume"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          {isSoundscapeLoading && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse opacity-70"
                 style={{ boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
          )}
        </button>
      </div>

      <div className="mt-2 text-white text-center">
        <span className="text-sm font-mono">{instructorVolume} / {soundscapeVolume}</span>
      </div>
    </div>
  );
}

