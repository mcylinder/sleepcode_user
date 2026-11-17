import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '@/components/ClientAuthProvider'
import CookieBanner from '@/components/CookieBanner'
import { DissolveProvider } from '@/components/ui/Dissolve'

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-hanken',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-space-mono',
})

const SITE_URL = 'https://sleepcoding.me'
const SITE_DESCRIPTION =
  'Supraliminal means nothing is hidden. Pick a goal, press play as you drift off, and one calm voice speaks clear affirmations about it, set to a steady pulse.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SleepCode — Supraliminal audio for specific goals',
    template: '%s · SleepCode',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'SleepCode',
    title: 'SleepCode — Supraliminal audio for specific goals',
    description: SITE_DESCRIPTION,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'SleepCode' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SleepCode — Supraliminal audio for specific goals',
    description: SITE_DESCRIPTION,
    images: ['/og.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#ddd3c5',
  // Default for sand pages; the player overrides this client-side while mounted.
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${spaceMono.variable}`}>
      <body>
        <ClientAuthProvider>
          <DissolveProvider>
            {children}
            <CookieBanner />
          </DissolveProvider>
        </ClientAuthProvider>
      </body>
    </html>
  )
}
