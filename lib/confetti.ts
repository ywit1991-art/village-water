import confetti from 'canvas-confetti'

/**
 * ยิง confetti เฉลิมฉลองตอนบันทึกสำเร็จ
 * @param type - 'success' (น้อย) | 'celebration' (เยอะ)
 */
export function fireConfetti(type: 'success' | 'celebration' = 'success') {
  const count = type === 'celebration' ? 200 : 80
  const spread = type === 'celebration' ? 100 : 70

  const defaults = {
    particleCount: count,
    spread,
    origin: { y: 0.7 },
    colors: ['#0ea5e9', '#22c55e', '#fbbf24', '#f97316', '#a855f7'],
    ticks: 200,
    scalar: type === 'celebration' ? 1.2 : 1,
  }

  // ยิงจากซ้าย
  confetti({
    ...defaults,
    angle: 60,
    origin: { x: 0, y: 0.7 },
  })

  // ยิงจากขวา
  setTimeout(() => {
    confetti({
      ...defaults,
      angle: 120,
      origin: { x: 1, y: 0.7 },
    })
  }, 150)
}