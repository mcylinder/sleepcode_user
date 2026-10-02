import Link from 'next/link';

type Tab = 'home' | 'account';

const TABS: { id: Tab; label: string; href: string }[] = [
  { id: 'home', label: 'Home', href: '/application' },
  { id: 'account', label: 'Account', href: '/account' },
];

// Tab-bar destinations: bottom tab bar below 900px, persistent side-nav at and above.
// Fixed viewport height so the tab bar stays put while the content column scrolls.
export default function AppShell({
  active,
  topbar,
  children,
}: {
  active: Tab;
  topbar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen h-[100dvh] flex-col wide:flex-row">
      <nav className="sc-sidenav hidden wide:flex" aria-label="Main">
        <Link href="/" className="sc-sidenav-wordmark">SleepCode</Link>
        <div className="sc-sidenav-links">
          {TABS.map((tab) => (
            <Link key={tab.id} href={tab.href} className={tab.id === active ? 'is-active' : undefined}>
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex-shrink-0 px-[26px] pt-[30px] wide:hidden">{topbar}</div>

        <div className="min-h-0 flex-1 overflow-y-auto px-[26px] pt-[30px] wide:px-12 wide:pb-[30px] wide:pt-10">
          {children}
          <div className="h-5" />
        </div>

        <div className="sc-tabbar wide:hidden">
          <div className="sc-fade-bottom" />
          <nav className="sc-tabbar-row" aria-label="Main">
            {TABS.map((tab) => (
              <Link key={tab.id} href={tab.href} className={tab.id === active ? 'is-active' : undefined}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
