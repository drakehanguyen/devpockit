import { ThemeProvider } from '@/components/providers/ThemeProvider'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DevPockit - Essential Developer Tools',
  description: 'A comprehensive collection of developer tools organized by categories. All tools run entirely in your browser for optimal performance and privacy.',
  keywords: ['developer tools', 'json formatter', 'lorem ipsum', 'yaml converter', 'developer utilities'],
  authors: [{ name: 'DevPockit Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
