import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const noto = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-noto-thai',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ระบบประปาหมู่บ้าน · ทต.ท่าวังทอง',
  description: 'ข้อมูลระบบประปาหมู่บ้าน 14 แห่ง ต.ท่าวังทอง อ.เมืองพะเยา จ.พะเยา',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={noto.variable}>
      <body className="font-sans bg-brand-50/40 text-slate-800 antialiased min-h-screen flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}