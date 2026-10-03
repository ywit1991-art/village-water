'use client'

import { useEffect, useState } from 'react'

interface Props {
  /** timestamp (ISO string หรือ Date) — ถ้าไม่ส่งจะใช้เวลาปัจจุบัน */
  value?: string | Date | null
  /** 'datetime' = วันที่ + เวลา / 'date' = วันที่เท่านั้น */
  mode?: 'datetime' | 'date'
  /** format แบบไทย */
  format?: 'short' | 'long'
  /** ถ้าไม่มีข้อมูลให้แสดงอะไร */
  fallback?: string
  className?: string
}

/**
 * Component แสดงวันที่ที่ render **เฉพาะฝั่ง client** เท่านั้น
 * ป้องกัน Hydration Error จาก `new Date()`
 */
export function ClientDate({
  value,
  mode = 'datetime',
  format = 'short',
  fallback = '–',
  className,
}: Props) {
  const [text, setText] = useState<string>('')

  useEffect(() => {
    function compute() {
      const d = value ? new Date(value) : new Date()
      if (isNaN(d.getTime())) {
        setText(fallback)
        return
      }

      if (mode === 'date') {
        if (format === 'long') {
          setText(
            d.toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          )
        } else {
          setText(
            d.toLocaleDateString('th-TH', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          )
        }
      } else {
        setText(d.toLocaleString('th-TH'))
      }
    }

    compute()
  }, [value, mode, format, fallback])

  if (!text) {
    return <span className={className}>{fallback}</span>
  }

  return <span className={className}>{text}</span>
}