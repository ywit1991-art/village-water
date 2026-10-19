import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  
  // ⭐ เพิ่ม 2 บรรทัดนี้ เพื่อบอกให้ดึงหน้า /offline มาแสดง
  fallbacks: {
    document: "/offline", 
  },
});

const nextConfig: NextConfig = {
  turbopack: {}, 
};

export default withPWA(nextConfig);