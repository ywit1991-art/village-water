import { IBM_Plex_Sans_Thai } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import SplashScreen from '@/components/ui/SplashScreen'; // 👈 เพิ่มบรรทัดนี้
import type { Metadata, Viewport } from 'next'; // 👈 เพิ่ม Viewport

const ibmPlex = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ระบบข้อมูลกลุ่มเปราะบาง | เทศบาล',
  description: 'ระบบติดตามและให้ความช่วยเหลือกลุ่มเปราะบาง',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'กลุ่มเปราะบาง',
  },
  formatDetection: {
    telephone: false,
  },
};

// 👇 เพิ่มส่วน Viewport เพื่อควบคุมสีแถบสถานะบนมือถือ 👇
export const viewport: Viewport = {
  themeColor: '#EC4899',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={ibmPlex.variable}>
      <head>
        {/* 👇 ไอคอนสำหรับ iPhone/iPad 👇 */}
        <link rel="apple-touch-icon" href="/icons/apple-icon.png" />
      </head>
            <body className="font-sans antialiased bg-gradient-soft min-h-screen">
        <SplashScreen />   
        {children}
        <Toaster position="bottom-right" toastOptions={{ className: '!rounded-2xl !shadow-soft !border-white/60' }} />
      </body>
    </html>
  );
}