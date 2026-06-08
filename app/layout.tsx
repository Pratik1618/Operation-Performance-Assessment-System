import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClientProviders } from '@/components/layout/client-providers'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Operation Performance Assessment System',
  description: 'Enterprise Operations Performance Assessment System',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ClientProviders>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto bg-background">
                <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ClientProviders>
      </body>
    </html>
  )
}
