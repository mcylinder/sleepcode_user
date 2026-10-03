// Four concentric rings and a centre dot. While `glowing`, each ring glows in turn (inner to
// outer) and the dot leads; at rest the rings sit at `restOpacity`.
const RING_SIZES = [34, 55, 76, 97];

export default function Rings({
  color,
  glowing = false,
  restOpacity,
  className = '',
}: {
  color: string;
  glowing?: boolean;
  restOpacity: number;
  className?: string;
}) {
  return (
    <div className={`relative aspect-square w-full ${className}`} style={{ color }} aria-hidden="true">
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
            animation: glowing ? `scGlow 6s ease-in-out ${0.7 + i * 0.7}s infinite` : 'none',
          }}
        />
      ))}
      <div
        className="sc-ring-dot absolute left-1/2 top-1/2 h-[9%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'currentColor',
          opacity: glowing ? 1 : 0.75,
          transition: 'opacity 1.4s ease',
          animation: glowing ? 'scDotGlow 6s ease-in-out infinite' : 'none',
        }}
      />
    </div>
  );
}
