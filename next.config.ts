import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // ⭐ ปิดตอน Dev
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline", // ⭐ ต้องมีบรรทัดนี้
  },
})

const nextConfig: NextConfig = {
  turbopack: {}, 
};

export default withPWA(nextConfig);