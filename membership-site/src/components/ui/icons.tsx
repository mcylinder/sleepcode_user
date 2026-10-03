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
