'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const FADE_IN_MS = 900;
const FADE_OUT_MS = 1400;
const REDUCED_MS = 200;
// If the destination never renders (an error or a redirect elsewhere), lift the layer anyway.
const SAFETY_MS = 5000;

type Phase = 'idle' | 'in' | 'out';

const DissolveContext = createContext<(href: string) => void>(() => {});

// Entering the player: a full-viewport layer in the player's colour fades in, the route
// changes underneath it, then the layer fades out over the player.
export function DissolveProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const [reduced, setReduced] = useState(false);
  const pushed = useRef(false);
  const fromPath = useRef<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const fadeOut = useCallback(() => {
    pushed.current = false;
    setPhase('out');
    later(() => setPhase('idle'), reduced ? REDUCED_MS : FADE_OUT_MS);
  }, [reduced, later]);

  const dissolveTo = useCallback(
    (href: string) => {
      if (phase !== 'idle') return;
      router.prefetch(href);
      fromPath.current = pathname;
      setPhase('in');
      later(() => {
        pushed.current = true;
        router.push(href);
        later(() => pushed.current && fadeOut(), SAFETY_MS);
      }, reduced ? REDUCED_MS : FADE_IN_MS);
    },
    [phase, pathname, reduced, router, fadeOut, later],
  );

  useEffect(() => {
    if (pushed.current && pathname !== fromPath.current) fadeOut();
  }, [pathname, fadeOut]);

  const duration = reduced ? REDUCED_MS : phase === 'in' ? FADE_IN_MS : FADE_OUT_MS;
  return (
    <DissolveContext.Provider value={dissolveTo}>
      {children}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[100]"
        style={{
          background: 'var(--p-bg)',
          opacity: phase === 'in' ? 1 : 0,
          pointerEvents: phase === 'idle' ? 'none' : 'auto',
          transition: `opacity ${duration}ms ease`,
        }}
      />
    </DissolveContext.Provider>
  );
}

export function useDissolve() {
  return useContext(DissolveContext);
}
