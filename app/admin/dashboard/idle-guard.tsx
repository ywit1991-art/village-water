'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { logoutAction } from '../actions'

interface Props {
  timeout?: number
  warnBefore?: number
}

export default function IdleGuard({
  timeout = 60_000,
  warnBefore = 15_000,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const lastActivity = useRef<number>(Date.now())
  const firedRef = useRef(false)

  useEffect(() => {
    console.log('[IdleGuard] mounted — timeout:', timeout, 'ms')
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'wheel',
    ]

    function reset() {
      lastActivity.current = Date.now()
      setSecondsLeft(null)
      firedRef.current = false
    }

    events.forEach(e =>
      window.addEventListener(e, reset, { passive: true }),
    )

    const interval = setInterval(() => {
      const idle = Date.now() - lastActivity.current
      const remaining = timeout - idle

      console.log('[IdleGuard] idle:', Math.round(idle / 1000), 's')

      if (remaining <= 0 && !firedRef.current) {
        firedRef.current = true
        console.log('[IdleGuard] 🔒 Auto logout triggered')
        handleLogout()
        return
      }

      if (remaining <= warnBefore && remaining > 0) {
        setSecondsLeft(Math.ceil(remaining / 1000))
      } else {
        setSecondsLeft(null)
      }
    }, 1000)

    return () => {
      events.forEach(e => window.removeEventListener(e, reset))
      clearInterval(interval)
    }
  }, [timeout, warnBefore])

  async function handleLogout() {
    try {
      // เรียก Server Action — บันทึก Audit Log + clear session + redirect
      await logoutAction()
    } catch (err: any) {
      // ⚠️ Server Action ที่ redirect() จะ throw NEXT_REDIRECT
      // Next.js จะจัดการให้เอง — ไม่ต้องทำอะไร
      const isRedirect =
        err?.message === 'NEXT_REDIRECT' ||
        err?.digest?.startsWith?.('NEXT_REDIRECT')

      if (isRedirect) return

      console.error('[IdleGuard] logout error:', err)

      // Fallback: ลบ cookie ผ่าน API แล้ว reload
      try {
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
        })
      } catch (fetchErr) {
        console.error('[IdleGuard] fallback fetch error:', fetchErr)
      }

      // Full reload เพื่อให้ middleware เช็ค session ใหม่
      window.location.href = '/admin'
    }
  }

  if (secondsLeft === null) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border border-brand-100">
        <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
          <Clock size={28} />
        </div>
        <h3 className="font-bold text-brand-900 text-lg mb-1">
          ไม่มีการใช้งาน
        </h3>
        <p className="text-sm text-brand-600 mb-4">
          ข้อมูลจะออกจากระบบอัตโนมัติใน
        </p>
        <p className="text-4xl font-extrabold text-brand-700 tabular-nums mb-5">
          {secondsLeft} วินาที
        </p>
        <button
          onClick={() => {
            window.dispatchEvent(new Event('mousemove'))
          }}
          className="btn-primary w-full py-2.5"
        >
          ทำงานต่อ
        </button>
      </div>
    </div>
  )
}