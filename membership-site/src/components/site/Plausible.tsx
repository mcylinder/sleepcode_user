import Script from 'next/script';

/** Cookieless Plausible. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN (e.g. sleepcoding.me). */
export default function Plausible() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
