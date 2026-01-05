import { AppLayout } from '@/components/layout/AppLayout'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import type { Metadata, Viewport } from 'next'
import { DM_Serif_Text, Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const dmSerifText = DM_Serif_Text({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-dm-serif',
})

export const metadata: Metadata = {
  title: 'DevPockit - Essential Developer Tools',
  description: 'Essential dev tools at your fingertips. Work faster with tools that respect your privacy.',
  keywords: ['developer tools', 'json formatter', 'lorem ipsum', 'yaml converter', 'developer utilities'],
  authors: [{ name: 'DevPockit Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${dmSerifText.variable}`}>
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
