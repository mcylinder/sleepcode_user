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
    'One calm voice, speaking in the first person over a slow pulse, says clearly and often how you\u2019d like to think about a goal. You hear every word.',
}

export const viewport: Viewport = {
  themeColor: '#ddd3c5',
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
