import Link from 'next/link';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
];

export default function SiteFooter({ compact = false }: { compact?: boolean }) {
  const links = compact ? LINKS.filter((l) => l.href === '/privacy' || l.href === '/terms') : LINKS;
  return (
    <footer className="mx-auto mt-[50px] flex w-full max-w-[1060px] flex-col gap-3 border-t border-line px-[30px] pb-[calc(30px+env(safe-area-inset-bottom,0px))] pt-6 wide:mt-[60px] wide:flex-row wide:items-center wide:justify-between wide:px-[60px] wide:pb-10 wide:pt-[26px]">
      <span className="sc-eyebrow--muted text-[10px]">SleepCode</span>
      <nav className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-fg-faint">
        {links.map((link, i) => (
          <span key={link.href} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden="true">&middot;</span>}
            <Link href={link.href} className="hover:text-fg-muted">{link.label}</Link>
          </span>
        ))}
      </nav>
    </footer>
  );
}
