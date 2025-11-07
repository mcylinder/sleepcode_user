'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on application page and all nested routes
  if (pathname === '/application' || pathname.startsWith('/application/')) {
    return null;
  }
  
  return <Footer />;
}

