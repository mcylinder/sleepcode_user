import { HEAD_PATH } from '@/components/ui/icons';

// A pulse born at the center dot travels outward through four rings, then into the
// head outline itself. One shared 3.5s cycle; each element differs only by --base and delay.
const RINGS: { r: number; base: number; delay: number; width: number }[] = [
  { r: 11, base: 0.62, delay: 0.47, width: 1.4 },
  { r: 18, base: 0.58, delay: 0.93, width: 1.3 },
  { r: 25, base: 0.54, delay: 1.4, width: 1.2 },
  { r: 32, base: 0.5, delay: 1.87, width: 1.2 },
];

type RingStyle = React.CSSProperties & { '--base': number };

export default function BreathingRings({ width = 150 }: { width?: number }) {
  return (
    <svg
      width={width}
      height={Math.round(width * 1.153)}
      viewBox="-3 -3 106 122"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--signal)' }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="ldHeadClip">
          <path d={HEAD_PATH} />
        </clipPath>
      </defs>
      <path className="sc-ring" style={{ '--base': 0.85, animationDelay: '2.33s' } as RingStyle} d={HEAD_PATH} strokeWidth="1.3" />
      <g clipPath="url(#ldHeadClip)">
        <circle className="sc-ring" style={{ '--base': 0.75, animationDelay: '0s' } as RingStyle} cx="50" cy="38" r="3.2" fill="currentColor" stroke="none" />
        {RINGS.map((ring) => (
          <circle
            key={ring.r}
            className="sc-ring"
            style={{ '--base': ring.base, animationDelay: `${ring.delay}s` } as RingStyle}
            cx="50"
            cy="38"
            r={ring.r}
            strokeWidth={ring.width}
          />
        ))}
      </g>
    </svg>
  );
}
