import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import RingField from '@/components/site/RingField';

// Library and Account use the same header and footer as the rest of the site,
// so the menu stays in one place everywhere (see useMainNav for the links).
export default function AppShell({
  maxWidth = 860,
  children,
}: {
  // Kept so existing callers compile; the active item comes from the URL.
  active?: 'library' | 'account';
  maxWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="sc-frame">
      <RingField />
      <SiteHeader />
      <main className="sc-px flex flex-1 flex-col pb-[var(--pad-section)] pt-[clamp(28px,5vw,72px)]">
        <div className="flex w-full flex-col" style={{ maxWidth }}>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
