'use client'

import { useEffect, useRef } from 'react'

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose?: () => void,
) {
  const containerRef = useRef<T>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    if (!container) return

    const getFocusable = () => {
      if (!container) return []
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(el => el.offsetParent !== null)
    }

    const focusables = getFocusable()
    if (focusables.length > 0) {
      setTimeout(() => focusables[0]?.focus(), 50)
    } else {
      container.focus()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }

      if (e.key !== 'Tab') return

      const c = containerRef.current
      if (!c) return

      const list = getFocusable()
      if (list.length === 0) return

      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement as HTMLElement

      if (e.shiftKey) {
        if (active === first || !c.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last || !c.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // ⭐ ใช้ scrollbar-gutter ใน CSS แทน — ไม่ต้องชดเชยใน JS
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = oldOverflow

      setTimeout(() => {
        previousFocusRef.current?.focus()
      }, 50)
    }
  }, [isOpen, onClose])

  return containerRef
}