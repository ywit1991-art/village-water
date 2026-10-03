'use client'

import { motion } from 'framer-motion'
import { Droplets } from 'lucide-react'

interface Props {
  title?: string
  subtitle?: string
}

export function LoadingScreen({
  title = 'กำลังโหลดข้อมูล',
  subtitle = 'กรุณารอสักครู่...',
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-sky-50 overflow-hidden">
      {/* Animated waves background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Wave 1 */}
        <motion.div
          animate={{
            x: ['-50%', '0%', '-50%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-0 left-0 w-[200%] h-64 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(14,165,233,0.4) 0%, transparent 70%)',
          }}
        />
        {/* Wave 2 */}
        <motion.div
          animate={{
            x: ['0%', '-50%', '0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-[200%] h-48 opacity-25"
          style={{
            background:
              'radial-gradient(ellipse at 30% 100%, rgba(56,189,248,0.5) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Floating drops */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, opacity: 0 }}
          animate={{
            y: ['-10%', '110%'],
            opacity: [0, 0.6, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'linear',
          }}
          className="absolute text-sky-400/60 pointer-events-none"
          style={{
            left: `${10 + i * 15}%`,
            fontSize: `${16 + i * 4}px`,
          }}
        >
          <Droplets />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Logo with pulsing glow */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-8"
        >
          {/* Rotating glow */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent, #38bdf8, transparent, #0284c7, transparent)',
              filter: 'blur(20px)',
              transform: 'scale(1.4)',
            }}
          />
          {/* Pulsing ring */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="absolute inset-0 rounded-full border-4 border-sky-400/50"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.5,
            }}
            className="absolute inset-0 rounded-full border-4 border-brand-400/40"
          />

          {/* Logo */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img
              src="/logo.png"
              alt="เทศบาลตำบลท่าวังทอง"
              className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-2xl ring-4 ring-white"
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xl md:text-2xl font-bold text-brand-900 mb-2"
        >
          {title}
          <LoadingDots />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-sm text-slate-500 mb-8"
        >
          {subtitle}
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-64 h-1.5 rounded-full bg-slate-200/70 overflow-hidden"
        >
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-sky-500 to-transparent"
          />
        </motion.div>

        {/* Small dots below */}
        <div className="flex items-center gap-2 mt-6">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 rounded-full bg-sky-500"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/** จุด 3 จุดวิ่งหลังคำ */
function LoadingDots() {
  return (
    <span className="inline-flex ml-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  )
}