import type { Metadata } from 'next';

export const CONTACT_EMAIL = 'contact@sleepcoding.me';

// Effective date shown on Privacy, Terms and Cookies. Update only when the policy text changes.
export const LEGAL_EFFECTIVE_DATE = 'October 22, 2026';

const SITE_NAME = 'SleepCode';

/** Document title + Open Graph / Twitter, using the root `%s · SleepCode` template. */
export function pageMeta(title: string, description?: string): Metadata {
  const shareTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    ...(description ? { description } : {}),
    openGraph: {
      title: shareTitle,
      ...(description ? { description } : {}),
      images: [{ url: '/og.jpg', width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      title: shareTitle,
      ...(description ? { description } : {}),
      images: ['/og.jpg'],
    },
  };
}
