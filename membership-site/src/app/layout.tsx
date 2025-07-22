import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '@/components/ClientAuthProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SleepCoding - Membership Support',
  description: 'Your membership support website for SleepCoding application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientAuthProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </ClientAuthProvider>
      </body>
    </html>
  )
}
