import type { PulseWidth } from '@/lib/audio/pulseWidth';

// Inline line icons, 1.6px stroke, colored by the surrounding text.
type IconProps = { size?: number; className?: string };

export function LockIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={`flex-shrink-0 ${className ?? ''}`} aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function StopwatchIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9.5 2.5h5" />
    </svg>
  );
}

// A window with its blind half down.
export function NightShadeIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 13h16" />
      <rect x="4" y="3" width="16" height="10" rx="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronRight({ className }: IconProps) {
  return (
    <svg width="7" height="11" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${className ?? ''}`} aria-hidden="true">
      <path d="M1.5 1 L6.5 6 L1.5 11" />
    </svg>
  );
}

export function PlayIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 2.2 L13.5 8 L4 13.8 Z" />
    </svg>
  );
}

export function PauseIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <rect x="3.5" y="2.5" width="3" height="11" rx="0.6" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="0.6" />
    </svg>
  );
}

// A page with lines of text.
export function StatementsIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function MoonIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />
    </svg>
  );
}

export function VoiceIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <path d="M17 6.5a4 4 0 010 5" />
      <path d="M19.5 4a7.5 7.5 0 010 10" />
    </svg>
  );
}

export function PulseIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function RepeatIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 014-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 01-4 4H3" />
    </svg>
  );
}

// level: 0 muted, 1–66 one wave, ≥67 two waves.
export function SpeakerIcon({ size = 22, level = 100, className }: IconProps & { level?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M4 10v4h4l5 4V6L8 10z" />
      {level === 0 ? (
        <path d="M17 9l5 6M22 9l-5 6" />
      ) : (
        <>
          <path d="M16.5 9a4 4 0 010 6" />
          {level >= 67 && <path d="M19.5 6a8 8 0 010 12" />}
        </>
      )}
    </svg>
  );
}

const WIDTH_SPAN: Record<PulseWidth, number> = { 0: 0, 33: 12, 66: 22, 100: 34 };

export function PulseWidthGlyph({
  width,
  track = 'var(--p-step-outline)',
  fill = 'var(--p-accent)',
  className,
}: {
  width: PulseWidth;
  track?: string;
  fill?: string;
  className?: string;
}) {
  const span = WIDTH_SPAN[width];
  return (
    <svg width="34" height="6" viewBox="0 0 34 6" className={className} aria-hidden="true">
      <rect x="0" y="1" width="34" height="4" rx="2" fill={track} />
      {width === 0 ? (
        <circle cx="17" cy="3" r="3" fill={fill} />
      ) : (
        <rect x={(34 - span) / 2} y="1" width={span} height="4" rx="2" fill={fill} />
      )}
    </svg>
  );
}
