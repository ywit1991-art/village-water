'use client'

import { useEffect, useRef } from 'react'

/**
 * ตรวจจับการไม่ใช้งาน (idle)
 * เมื่อครบ timeoutMs → เรียก onIdle()
 */
export function useIdleTimer(
  onIdle: () => void,
  timeoutMs: number = 60_000,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onIdleRef = useRef(onIdle)

  // เก็บ callback ล่าสุดไว้เสมอ
  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onIdleRef.current()
      }, timeoutMs)
    }

    // event ที่ถือว่า "ใช้งานอยู่"
    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'wheel',
    ]

    events.forEach(e => window.addEventListener(e, reset, { passive: true }))

    // เริ่มจับเวลาครั้งแรก
    reset()

    return () => {
      events.forEach(e => window.removeEventListener(e, reset))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeoutMs])
}