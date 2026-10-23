import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: false, // 👈 ปิด Source Maps ช่วยลด RAM
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'leaflet', 'react-leaflet'], // 👈 Tree-shake ไลบรารีหนัก
    webpackMemoryOptimizations: true, // 👈 ลดการใช้ RAM ตอน Build
  },
};

export default withPWA(nextConfig);