type IconProps = { size?: number; className?: string };

export function HexLogo({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="var(--fg-faint)" strokeWidth="1.1" className={className} aria-hidden="true">
      <path d="M10 2 L15 5.5 L15 14.5 L10 18 L5 14.5 L5 5.5 Z" strokeLinejoin="round" />
      <path d="M10 2 L10 8 M15 5.5 L11 9.5 M15 14.5 L10.5 11.5 M10 18 L10 12 M5 14.5 L9 11 M5 5.5 L9.5 9" opacity="0.5" />
    </svg>
  );
}

// Locked content: a plain outline padlock in --fg-faint, never a color.
export function LockIcon({ size = 13, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="var(--fg-faint)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${className ?? ''}`} aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M6.5 9 V6.2 a3.5 3.5 0 0 1 7 0 V9" />
    </svg>
  );
}

export function ChevronRight({ className }: IconProps) {
  return (
    <svg width="7" height="11" viewBox="0 0 8 12" fill="none" stroke="var(--fg-faint)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${className ?? ''}`} aria-hidden="true">
      <path d="M1.5 1 L6.5 6 L1.5 11" />
    </svg>
  );
}

export function ChevronLeft({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="var(--fg-faint)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.5 5 L7 10 L12.5 15" />
    </svg>
  );
}

export function UserIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="var(--fg-faint)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="7" r="3.6" />
      <path d="M3 17c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </svg>
  );
}

export const HEAD_PATH =
  'M64.57,3.71 C57.52,1.53 50.02,0.06 42.65,0.51 C35.35,0.96 27.84,3.01 21.64,6.91 C15.43,10.81 10.36,16.67 6.53,22.93 C2.72,29.15 0.39,36.57 0.11,43.86 C-0.18,51.21 1.39,58.72 4.05,65.58 C7.00,70.92 10.34,76.03 13.48,81.26 C16.51,86.32 19.24,92.72 17.76,98.43 C16.38,103.80 12.33,110.68 15.86,114.96 C22.89,117.92 52.74,116.24 60.52,115.19 C68.30,114.14 61.70,110.16 62.54,108.66 C63.39,107.16 62.28,106.56 65.58,106.19 C68.88,105.81 78.59,106.96 82.34,106.41 C86.09,105.87 87.08,104.86 88.08,102.92 C89.07,100.99 87.85,96.93 88.30,94.83 C88.75,92.73 90.55,91.68 90.78,90.33 C91.00,88.98 89.37,87.87 89.65,86.73 C89.93,85.58 92.33,85.45 92.46,83.46 C92.59,81.48 89.18,76.92 90.44,74.80 C91.69,72.68 100.07,74.73 100.00,70.75 C99.93,66.78 91.96,56.96 89.99,50.96 C88.02,44.96 89.39,39.86 88.19,34.76 C86.99,29.66 85.10,24.48 82.79,20.36 C80.48,16.24 77.39,12.79 74.35,10.01 C71.32,7.24 68.92,5.38 64.57,3.71 Z';
