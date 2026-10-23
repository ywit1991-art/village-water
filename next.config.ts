import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // สร้าง Service Worker ไว้ที่ public
  disable: process.env.NODE_ENV === "development", // ปิดการทำงานในโหมด dev (เพื่อไม่ให้ Cache ค้าง)
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: false, // (จากที่เราเคยตั้งไว้)
};

export default withPWA(nextConfig);