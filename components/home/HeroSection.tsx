'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, BarChart3, ChevronDown } from 'lucide-react'

interface Props {
  totalVillages: number
  totalSystems: number
}

export function HeroSection({ totalVillages, totalSystems }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />

      {/* SVG pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hero-pattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-pattern)" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-white/40 blur-2xl scale-110" />
            <img
              src="/logo.png"
              alt="ตราเทศบาล"
              className="relative w-28 h-28 md:w-32 md:h-32 rounded-full ring-4 ring-white/40 shadow-2xl"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight"
          >
            ข้อมูลประปาหมู่บ้าน
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-3 text-base md:text-lg text-brand-100"
          >
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </motion.p>

          {/* Stats inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 flex items-center gap-6 text-sm text-brand-100"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tabular-nums">
                {totalVillages}
              </span>
              <span>หมู่บ้าน</span>
            </div>
            <span className="w-px h-6 bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tabular-nums">
                {totalSystems}
              </span>
              <span>ข้อมูลประปา</span>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="#map"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-700 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <MapPin size={18} />
              ดูแผนที่
            </Link>
            <Link
              href="#stats"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 backdrop-blur text-white font-semibold ring-1 ring-white/30 hover:bg-white/25 transition-all"
            >
              <BarChart3 size={18} />
              ดูสถิติ
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center text-white/60"
        >
          <span className="text-[10px] mb-1">เลื่อนลง</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}