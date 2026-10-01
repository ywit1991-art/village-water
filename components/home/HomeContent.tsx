'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Droplets,
  Users,
  ClipboardCheck,
  MapPin,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'

interface Props {
  totalVillages: number
  totalSystems: number
  totalHouseholds: number
  totalSurveys: number
}

export default function HomeContent({
  totalVillages,
  totalSystems,
  totalHouseholds,
  totalSurveys,
}: Props) {
  const stats = [
    {
      value: totalVillages,
      label: 'หมู่บ้าน',
      icon: MapPin,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      value: totalSystems,
      label: 'ข้อมูลประปา',
      icon: Droplets,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      value: totalHouseholds,
      label: 'ครัวเรือน',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      value: totalSurveys,
      label: 'แบบสำรวจ',
      icon: ClipboardCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-50/60 via-white to-brand-50/30 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="absolute top-20 -right-40 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-200/20 blur-3xl" />

      {/* ============================ */}
      {/* HERO                          */}
      {/* ============================ */}
      <section
        id="main-content"
        className="relative flex-1 max-w-7xl mx-auto px-4 pt-16 md:pt-24 pb-12 w-full flex items-center"
      >
        <div className="flex flex-col items-center text-center w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 rounded-full bg-sky-300/40 blur-2xl scale-125 animate-pulse" />
            <img
              src="/logo.png"
              alt="ตราเทศบาลตำบลท่าวังทอง"
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl ring-4 ring-white"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold text-brand-900 leading-tight tracking-tight"
          >
            ข้อมูลประปาหมู่บ้าน
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-4 text-base md:text-lg text-brand-600 font-medium"
          >
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r from-sky-400 via-brand-500 to-indigo-500"
          />

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl"
          >
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={i}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ring-1 ring-slate-100"
                >
                  <div
                    className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-2 transition-transform group-hover:scale-110 ${s.bg} ${s.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div
                    className={`text-2xl md:text-3xl font-extrabold leading-none tabular-nums ${s.color}`}
                  >
                    <AnimatedCounter value={s.value} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {s.label}
                  </div>
                </div>
              )
            })}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
          >
            <Link
              href="/overview"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-brand-600 text-white font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
            >
              <MapPin size={18} />
              ดูข้อมูลประปาหมู่บ้าน
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/admin"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-semibold ring-2 ring-brand-200 hover:ring-brand-400 hover:bg-brand-50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
            >
              <Shield size={18} />
              สำหรับเจ้าหน้าที่
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================ */}
      {/* FOOTER                        */}
      {/* ============================ */}
      <footer className="relative mt-auto bg-gradient-to-r from-brand-800 to-brand-900 text-brand-100 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4">
          <img
            src="/logo.png"
            alt="ตราเทศบาล"
            className="w-12 h-12 rounded-full ring-2 ring-white/20 shrink-0"
          />
          <div className="text-xs md:text-sm leading-snug">
            <p className="font-medium text-white">
              เทศบาลตำบลท่าวังทอง เลขที่ 131 หมู่ที่ 4 ถนนพะเยา-ป่าแดด
            </p>
            <p className="text-brand-300 mt-0.5">
              ตำบลท่าวังทอง อำเภอเมืองพะเยา จังหวัดพะเยา 56000
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}