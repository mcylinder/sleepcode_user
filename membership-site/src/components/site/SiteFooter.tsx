import Link from 'next/link';

const LINKS = [
  { href: '/how-to-listen', label: 'How to listen' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

// The top hairline drops away when a tinted band ends the page (see .sc-site-footer).
export default function SiteFooter({ compact = false }: { compact?: boolean }) {
  const links = compact ? LINKS.filter((l) => l.href === '/privacy' || l.href === '/terms') : LINKS;
  return (
    <footer className="sc-site-footer sc-px flex flex-wrap justify-between gap-3 pb-[calc(28px+env(safe-area-inset-bottom,0px))] pt-7 text-[14px] text-ink-muted">
      <span>&copy; {new Date().getFullYear()} SleepCode</span>
      <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>
    </footer>
  );
}
