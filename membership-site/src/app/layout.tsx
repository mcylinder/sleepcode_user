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

export const metadata: Metadata = {
  title: 'SleepCode — Supraliminal audio for specific goals',
  description:
    'Supraliminal means nothing is hidden. Pick a goal, press play as you drift off, and one calm voice speaks clear statements about it, set to a steady pulse.',
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
