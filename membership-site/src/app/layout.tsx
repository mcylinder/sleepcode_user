import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '@/components/ClientAuthProvider'
import CookieBanner from '@/components/CookieBanner'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'SleepCode — Rewire How You Fall Asleep',
  description: 'One voice, speaking in first person, layered under a slow pulse. A method for falling asleep.',
}

export const viewport: Viewport = {
  themeColor: '#16191c',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="sc-dotgrid">
        <ClientAuthProvider>
          {children}
          <CookieBanner />
        </ClientAuthProvider>
      </body>
    </html>
  )
}
