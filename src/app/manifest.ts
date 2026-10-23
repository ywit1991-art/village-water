// src/app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ระบบข้อมูลกลุ่มเปราะบาง',
    short_name: 'กลุ่มเปราะบาง',
    description: 'ระบบข้อมูลกลุ่มเปราะบาง เทศบาลตำบลท่าวังทอง',
    start_url: '/',
    display: 'standalone', // 👈 ทำให้เปิดแบบเต็มจอ ไม่มีแถบ URL
    background_color: '#ffffff',
    theme_color: '#EC4899', // 👈 สีชมพูหลักของแอป
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}