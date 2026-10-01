'use client'

import { useEffect, useRef } from 'react'

interface Props {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  decimals = 0,
  suffix = '',
  className = '',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  // แสดงค่าจริงทันทีที่ render — กัน StrictMode และ raf fail
  const initialText =
    value.toLocaleString('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + suffix

  useEffect(() => {
    if (!ref.current) return
    if (value === 0) return

    const node = ref.current
    let raf = 0
    const start = performance.now()
    const totalMs = Math.max(duration * 1000, 200)

    function step(now: number) {
      const elapsed = now - start
      const p = Math.min(elapsed / totalMs, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const current = value * eased

      node.textContent =
        current.toLocaleString('th-TH', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + suffix

      if (p < 1) {
        raf = requestAnimationFrame(step)
      } else {
        node.textContent = initialText
      }
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, decimals, suffix])

  return (
    <span ref={ref} className={className}>
      {initialText}
    </span>
  )
}