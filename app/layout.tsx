import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { SkipLink } from '@/components/ui/skip-link'

// ⭐ เพิ่ม Viewport สำหรับ Theme สีของมือถือ
export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: {
    default: 'ข้อมูลประปาหมู่บ้าน - ทต.ท่าวังทอง',
    template: '%s | ประปาหมู่บ้าน ทต.ท่าวังทอง',
  },
  description:
    'ข้อมูลประปาหมู่บ้าน เทศบาลตำบลท่าวังทอง อำเภอเมืองพะเยา จังหวัดพะเยา',
  keywords: [
    'ประปาหมู่บ้าน',
    'ท่าวังทอง',
    'พะเยา',
    'เทศบาล',
    'ข้อมูล',
    'น้ำประปา',
  ],
  authors: [{ name: 'เทศบาลตำบลท่าวังทอง' }],
  creator: 'เทศบาลตำบลท่าวังทอง',
  manifest: '/manifest.webmanifest', // ⭐ ชี้ไปที่ manifest ที่สร้างในข้อ 1
  appleWebApp: {
    capable: true, // ⭐ ทำให้ iOS รองรับการติดตั้งแบบเต็มจอ
    statusBarStyle: 'default',
    title: 'ประปาหมู่บ้าน',
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    siteName: 'ข้อมูลประปาหมู่บ้าน - ทต.ท่าวังทอง',
    title: 'ข้อมูลประปาหมู่บ้าน - ทต.ท่าวังทอง',
    description:
      'ข้อมูลประปาหมู่บ้าน เทศบาลตำบลท่าวังทอง อำเภอเมืองพะเยา',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon-192x192.png', // ⭐ ไอคอนสำหรับ iPhone/iPad
  },
  robots: {
    index: true,
    follow: true,
  },
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
      </head>
      <body className="antialiased">
        <SkipLink />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}