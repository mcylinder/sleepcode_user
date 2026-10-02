import Link from 'next/link';
import { ChevronLeft, HexLogo } from './icons';

// Pages you navigate INTO (player, pickers, login) get a back chevron, never the tab bar.
export default function BackHeader({ href, label = 'SleepCode' }: { href: string; label?: string }) {
  return (
    <div className="flex items-center justify-between px-[28px] pt-[28px] wide:px-[60px] wide:pt-[34px]">
      <Link href={href} aria-label="Back" className="flex -ml-1 p-1">
        <ChevronLeft />
      </Link>
      <div className="sc-eyebrow--muted">{label}</div>
      <HexLogo size={17} />
    </div>
  );
}
