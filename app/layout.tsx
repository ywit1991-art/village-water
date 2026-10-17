import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { SkipLink } from '@/components/ui/skip-link'
import { PWAProvider } from '@/components/pwa/pwa-provider'

export const metadata: Metadata = {
  title: {
    default: 'ระบบประปาหมู่บ้าน - ทต.ท่าวังทอง',
    template: '%s | ประปาหมู่บ้าน ทต.ท่าวังทอง',
  },
  description:
    'ฐานข้อมูลประปาหมู่บ้าน เทศบาลตำบลท่าวังทอง อำเภอเมืองพะเยา จังหวัดพะเยา',
  keywords: [
    'ประปาหมู่บ้าน',
    'ท่าวังทอง',
    'พะเยา',
    'เทศบาล',
    'ฐานข้อมูล',
    'น้ำประปา',
  ],
  authors: [{ name: 'เทศบาลตำบลท่าวังทอง' }],
  creator: 'เทศบาลตำบลท่าวังทอง',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ประปาหมู่บ้าน',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    siteName: 'ระบบประปาหมู่บ้าน - ทต.ท่าวังทอง',
    title: 'ระบบประปาหมู่บ้าน - ทต.ท่าวังทอง',
    description:
      'ฐานข้อมูลประปาหมู่บ้าน เทศบาลตำบลท่าวังทอง อำเภอเมืองพะเยา',
    images: ['/logo.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152.png', sizes: '152x152' },
      { url: '/icons/icon-192.png', sizes: '192x192' },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Sarabun:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* ⭐ Apple specific meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="ประปาหมู่บ้าน" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <SkipLink />
        {children}
        <Toaster position="top-right" richColors />
        <PWAProvider />
      </body>
    </html>
  )
}