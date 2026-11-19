import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '@/components/ClientAuthProvider'
import CookieBanner from '@/components/CookieBanner'
import Plausible from '@/components/site/Plausible'
import { DissolveProvider } from '@/components/ui/Dissolve'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-plex-mono',
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
  themeColor: '#10131a',
  // Midnight everywhere; the player darkens this client-side while playing.
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${plexMono.variable}`}>
      <body>
        <Plausible />
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
