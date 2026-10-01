'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface Props {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  decimals = 0,
  suffix = '',
  className = '',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  })

  useEffect(() => {
    if (inView) {
      motionValue.set(value)
    }
  }, [inView, value, motionValue])

  useEffect(() => {
    const unsubscribe = spring.on('change', latest => {
      if (ref.current) {
        ref.current.textContent =
          latest.toLocaleString('th-TH', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) + suffix
      }
    })
    return () => unsubscribe()
  }, [spring, decimals, suffix])

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}