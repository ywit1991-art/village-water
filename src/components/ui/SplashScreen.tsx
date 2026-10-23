'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 👇 แสดงผลตายตัว 2.5 วินาที แล้วค่อย Fade out 👇
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-soft opacity-50" />
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-300/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sky-300/20 blur-[120px] rounded-full" />

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0, 0.71, 0.2, 1.01], delay: 0.2 }}
            className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-full shadow-glow p-2 flex items-center justify-center border-4 border-white z-10"
          >
            <Image
              src="/logo.png"
              alt="เทศบาลตำบลท่าวังทอง"
              width={160}
              height={160}
              className="object-contain drop-shadow-md"
              priority
            />
            
            {/* วงแหวนหมุนรอบโลโก้ */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-15px] rounded-full border-2 border-dashed border-pink-300/50"
            />
          </motion.div>

          {/* Text Animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 text-center z-10"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent mb-2">
              ระบบข้อมูลกลุ่มเปราะบาง
            </h1>
            <p className="text-slate-500 font-medium text-sm tracking-widest uppercase">
              เทศบาลตำบลท่าวังทอง
            </p>
            <p className="text-slate-400 text-xs mt-1">
              อำเภอเมืองพะเยา จังหวัดพะเยา
            </p>
          </motion.div>

          {/* Loading Bar ด้านบน */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            className="absolute bottom-40 h-1.5 bg-gradient-brand rounded-full overflow-hidden"
          >
             <div className="w-full h-full bg-white/30 animate-pulse" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}