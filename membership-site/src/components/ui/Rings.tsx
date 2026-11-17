// Four concentric rings and a centre dot. While `glowing`, rings pulse gently on the
// audio beat (inner → outer ripple). At rest they sit at `restOpacity`. Optional
// `children` replace the centre dot (play/pause in the player).
const RING_SIZES = [34, 55, 76, 97];
const DEFAULT_BEAT_SEC = 1;

export default function Rings({
  color,
  glowing = false,
  restOpacity,
  beatSec = DEFAULT_BEAT_SEC,
  className = '',
  children,
}: {
  color: string;
  glowing?: boolean;
  restOpacity: number;
  /** Seconds per beat; matches SessionEngine pulse (pulse.m4a / 2). */
  beatSec?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const period = Math.max(0.4, Math.min(3, beatSec || DEFAULT_BEAT_SEC));

  return (
    <div
      className={`relative aspect-square w-full ${glowing ? 'sc-rings-glowing' : ''} ${className}`}
      style={{ color, ['--sc-beat' as string]: `${period}s` }}
    >
      <div aria-hidden="true">
        {RING_SIZES.map((size, i) => (
          <div
            key={size}
            className="sc-ring absolute left-1/2 top-1/2 box-border -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              border: '1.5px solid currentColor',
              opacity: restOpacity,
              transition: 'opacity 1.4s ease',
              animation: glowing ? `scPulseBeat ${period}s ease-in-out infinite` : 'none',
              animationDelay: glowing ? `${i * period * 0.12}s` : undefined,
            }}
          />
        ))}
        {!children && (
          <div
            className="sc-ring-dot absolute left-1/2 top-1/2 h-[9%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'currentColor',
              opacity: glowing ? 1 : 0.75,
              transition: 'opacity 1.4s ease',
              animation: glowing ? `scPulseDot ${period}s ease-in-out infinite` : 'none',
            }}
          />
        )}
      </div>
      {children && (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
    </div>
  );
}
