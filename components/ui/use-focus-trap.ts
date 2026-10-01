'use client'

import { useEffect, useRef } from 'react'

/**
 * Focus Trap Hook — ล็อก focus ให้วนใน modal
 * - กด Tab → วนเฉพาะ elements ใน modal
 * - กด Shift+Tab → วนย้อนกลับ
 * - กด Esc → เรียก onClose
 * - Focus element แรกอัตโนมัติ
 * - คืนค่า focus กลับให้ element เดิมเมื่อปิด
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose?: () => void,
) {
  const containerRef = useRef<T>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // เก็บ element ที่มี focus อยู่ก่อนเปิด
    previousFocusRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    // หา focusable elements ทั้งหมดใน modal
    const getFocusable = () => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(el => el.offsetParent !== null) // กรอง hidden
    }

    // Focus element แรกอัตโนมัติ (หรือ modal เอง)
    const focusables = getFocusable()
    if (focusables.length > 0) {
      setTimeout(() => focusables[0].focus(), 50)
    } else {
      container.focus()
    }

    // จัดการ Tab / Shift+Tab / Esc
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }

      if (e.key !== 'Tab') return

      const focusables = getFocusable()
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement

      if (e.shiftKey) {
        // Shift+Tab: ถ้าอยู่แรก → ไปท้าย
        if (active === first || !container.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab: ถ้าอยู่ท้าย → ไปแรก
        if (active === last || !container.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // ป้องกัน scroll body
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = oldOverflow

      // คืน focus ให้ element เดิม
      setTimeout(() => {
        previousFocusRef.current?.focus()
      }, 50)
    }
  }, [isOpen, onClose])

  return containerRef
}