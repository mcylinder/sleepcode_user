import type { Metadata } from 'next';
import NotFoundContent from '@/components/site/NotFoundContent';

export const metadata: Metadata = { title: 'Page not found \u2014 SleepCode' };

export default function SiteNotFound() {
  return <NotFoundContent />;
}
