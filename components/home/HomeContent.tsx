'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets,
  Users,
  MapPin,
  ArrowRight,
  Shield,
  Calculator,
  ChevronDown,
} from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { CalcShowcase } from './CalcShowcase'

interface Props {
  totalVillages: number
  totalSystems: number
  totalHouseholds: number
}

export default function HomeContent({
  totalVillages,
  totalSystems,
  totalHouseholds,
}: Props) {
  const [showCalc, setShowCalc] = useState(false)

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
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-50/60 via-white to-brand-50/30 relative overflow-hidden">
      {/* ⭐ Animated decorative blobs — เคลื่อนไหวตลอด */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 -left-40 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-20 -right-40 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          x: [-30, 30, -30],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-200/20 blur-3xl pointer-events-none"
      />

      {/* HERO */}
      <section
        id="main-content"
        className="relative max-w-7xl mx-auto px-4 pt-12 md:pt-20 pb-8 md:pb-12 w-full"
      >
        <div className="flex flex-col items-center text-center w-full">
          {/* ⭐ Logo — ลอยขึ้นลงตลอดเวลา */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative mb-6 md:mb-8"
          >
            <motion.div
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Glow หมุนรอบ */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent, #38bdf8, transparent, #a855f7, transparent)',
                  filter: 'blur(20px)',
                  transform: 'scale(1.3)',
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-sky-300/40 blur-2xl"
              />
              <img
                src="/logo.png"
                alt="ตราเทศบาลตำบลท่าวังทอง"
                className="relative w-28 h-28 md:w-40 md:h-40 rounded-full object-cover shadow-2xl ring-4 ring-white"
              />
            </motion.div>
          </motion.div>

          {/* ⭐ Title — มี shimmer วิ่งผ่าน */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-6xl font-extrabold leading-tight tracking-tight relative"
            style={{
              background:
                'linear-gradient(90deg, #0369a1, #0284c7, #0ea5e9, #0284c7, #0369a1)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shine 4s linear infinite',
            }}
          >
            ข้อมูลประปาหมู่บ้าน
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-3 md:mt-4 text-sm md:text-lg text-brand-600 font-medium px-4"
          >
            เทศบาลตำบลท่าวังทอง · อำเภอเมืองพะเยา · จังหวัดพะเยา
          </motion.p>

          {/* ⭐ Divider — ขยาย-หด ตลอด */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: [1, 1.5, 1] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.5 },
              scaleX: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              },
            }}
            className="mt-5 md:mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r from-sky-400 via-brand-500 to-indigo-500"
          />

          {/* ⭐ Stats Cards — ลอยขึ้นลงสลับกัน */}
          <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.65 + i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="relative"
                >
                  {/* ⭐ ลอยขึ้นลง ตลอดเวลา */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    }}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg transition-all duration-300 ring-1 ring-slate-100 cursor-default"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.08, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.4,
                      }}
                      className={`inline-flex w-10 h-10 md:w-12 md:h-12 rounded-xl items-center justify-center mb-3 ${s.bg} ${s.color}`}
                    >
                      <Icon size={20} className="md:w-[22px] md:h-[22px]" />
                    </motion.div>
                    <div
                      className={`text-2xl md:text-4xl font-extrabold leading-none tabular-nums ${s.color}`}
                    >
                      <AnimatedCounter value={s.value} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1.5 font-medium">
                      {s.label}
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
          >
            {/* ⭐ ปุ่มตัวอย่างการคำนวณ — หายใจเบาๆ */}
            <motion.button
              type="button"
              onClick={() => setShowCalc(o => !o)}
              aria-expanded={showCalc}
              aria-controls="calc-showcase"
              animate={{
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-semibold ring-2 ring-brand-200 hover:ring-brand-400 hover:bg-brand-50 shadow-sm hover:shadow-md transition-all w-full sm:w-auto justify-center"
            >
              <Calculator size={18} />
              ตัวอย่างการคำนวณ
              <motion.span
                animate={{ rotate: showCalc ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} />
              </motion.span>
            </motion.button>

            {/* ⭐ ปุ่มหลัก — เรืองแสง */
            }
            <motion.div
              animate={{
                boxShadow: [
                  '0 10px 15px -3px rgba(14,165,233,0.3), 0 4px 6px -4px rgba(14,165,233,0.2)',
                  '0 20px 25px -5px rgba(14,165,233,0.5), 0 8px 10px -6px rgba(14,165,233,0.4)',
                  '0 10px 15px -3px rgba(14,165,233,0.3), 0 4px 6px -4px rgba(14,165,233,0.2)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="rounded-xl w-full sm:w-auto"
            >
              <Link
                href="/overview"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-brand-600 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                <MapPin size={18} />
                ดูข้อมูลประปาหมู่บ้าน
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="inline-block"
                >
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
            </motion.div>

            <Link
              href="/admin"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-semibold ring-2 ring-brand-200 hover:ring-brand-400 hover:bg-brand-50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              <Shield size={18} />
              สำหรับเจ้าหน้าที่
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 📐 EXPANDABLE: CalcShowcase */}
      <AnimatePresence initial={false}>
        {showCalc && (
          <motion.div
            id="calc-showcase"
            key="calc"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden relative"
          >
            <div className="border-t border-brand-100 bg-white/50">
              <CalcShowcase />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="relative mt-auto bg-gradient-to-r from-brand-800 to-brand-900 text-brand-100 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4">
          <motion.img
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
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

      {/* ⭐ CSS Shimmer keyframes */}
      <style jsx>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  )
}