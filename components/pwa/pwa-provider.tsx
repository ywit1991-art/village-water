'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Share, PlusSquare } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // ==================
    // 1. Register Service Worker
    // ==================
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(reg => {
            console.log('[PWA] Service Worker registered:', reg.scope)
          })
          .catch(err => {
            console.warn('[PWA] SW registration failed:', err)
          })
      })
    }

    // ==================
    // 2. Check dismissed
    // ==================
    const isDismissed = localStorage.getItem('pwa-install-dismissed')
    if (isDismissed === 'true') {
      setDismissed(true)
    }

    // ==================
    // 3. Detect iOS
    // ==================
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isIOS && !isStandalone && !isDismissed) {
      // แสดง prompt หลัง 5 วินาที
      setTimeout(() => setShowIOSPrompt(true), 5000)
    }

    // ==================
    // 4. Android — beforeinstallprompt
    // ==================
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      if (!isDismissed) {
        setTimeout(() => setShowAndroidPrompt(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [dismissed])

  async function handleInstall() {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('[PWA] Install accepted')
      } else {
        console.log('[PWA] Install dismissed')
      }

      setDeferredPrompt(null)
      setShowAndroidPrompt(false)
    } catch (err) {
      console.error('[PWA] Install error:', err)
    }
  }

  function handleDismiss() {
    setShowAndroidPrompt(false)
    setShowIOSPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  return (
    <>
      {/* Android install prompt */}
      <AnimatePresence>
        {showAndroidPrompt && !dismissed && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-4 left-4 right-4 z-[9999] max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-brand-100 p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Download size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brand-900 text-sm">
                  ติดตั้งแอปประปาหมู่บ้าน
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  เพิ่มไปยังหน้าจอหลัก เปิดได้เหมือนแอปจริง
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-sm font-medium transition"
                  >
                    ติดตั้ง
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-sm font-medium transition"
                  >
                    ไม่ใช่ตอนนี้
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 shrink-0"
                aria-label="ปิด"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS install prompt */}
      <AnimatePresence>
        {showIOSPrompt && !dismissed && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-4 left-4 right-4 z-[9999] max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-brand-100 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Share size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-900 text-sm">
                    ติดตั้งแอปบน iPhone
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ทำตาม 2 ขั้นตอนนี้
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-slate-600 shrink-0"
                  aria-label="ปิด"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Share size={16} />
                  </div>
                  <p className="text-sm text-slate-700">
                    1. กดปุ่ม{' '}
                    <strong className="text-slate-900">Share</strong> ที่แถบล่าง
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <PlusSquare size={16} />
                  </div>
                  <p className="text-sm text-slate-700">
                    2. เลือก{' '}
                    <strong className="text-slate-900">
                      "เพิ่มไปยังหน้าจอหลัก"
                    </strong>
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="mt-3 w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-sm font-medium transition"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}