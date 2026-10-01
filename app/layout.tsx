import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { SkipLink } from '@/components/ui/skip-link'

export const metadata: Metadata = {
  title: 'ระบบประปาหมู่บ้าน - ทต.ท่าวังทอง',
  description: 'ระบบฐานข้อมูลประปาหมู่บ้าน เทศบาลตำบลท่าวังทอง',
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