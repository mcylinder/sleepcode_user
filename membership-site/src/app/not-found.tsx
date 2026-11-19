import type { Metadata } from 'next';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import NotFoundContent from '@/components/site/NotFoundContent';

export const metadata: Metadata = { title: 'Page not found \u2014 SleepCode' };

export default function NotFound() {
  return (
    <div className="sc-frame">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </div>
  );
}
