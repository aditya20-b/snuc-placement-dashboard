import type { Metadata } from 'next'
import { Providers } from './providers'
import { Sidebar } from '@/components/layout/sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Placement Dashboard',
  description: 'Your comprehensive placement portal for jobs, events, and analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 dark:bg-gray-950">
        <Providers>
          <Sidebar />
          <main className="lg:pl-64 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}