import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ข้อมูลประปาหมู่บ้าน - ทต.ท่าวังทอง',
    short_name: 'ประปาหมู่บ้าน', // ชื่อที่จะโชว์ใต้ไอคอนบนมือถือ
    description: 'ข้อมูลประปาหมู่บ้าน เทศบาลตำบลท่าวังทอง อำเภอเมืองพะเยา',
    start_url: '/',
    display: 'standalone', // ⭐ ทำให้เปิดแอปแล้วเต็มจอ ไม่มีแถบ URL
    background_color: '#ffffff',
    theme_color: '#0284c7', // สีแถบด้านบน (สี brand-600)
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}