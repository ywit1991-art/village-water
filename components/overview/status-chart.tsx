'use client'

import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'

interface Props {
  statusCount: Record<string, number>
  total: number
}

const ORDER = ['ดี', 'พอใช้', 'ต้องปรับปรุง', 'เร่งด่วน', 'ไม่มีข้อมูล']

export default function StatusChart({ statusCount, total }: Props) {
  if (total === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-bold text-brand-900 mb-4">สถานะระบบประปา</h2>
        <p className="text-sm text-brand-400 text-center py-10">ยังไม่มีข้อมูล</p>
      </div>
    )
  }

  let cumulative = 0
  const segments: string[] = []
  ORDER.forEach(key => {
    const count = statusCount[key] ?? 0
    if (count === 0) return
    const pct = (count / total) * 100
    const start = cumulative
    cumulative += pct
    const color = STATUS_COLORS[key]?.hex ?? '#94a3b8'
    segments.push(`${color} ${start}% ${cumulative}%`)
  })

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-brand-900 mb-4">สถานะระบบประปา</h2>
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-56 h-56 rounded-full" style={{ background: `conic-gradient(${segments.join(', ')})` }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
              <p className="text-4xl font-extrabold text-brand-900">{total}</p>
              <p className="text-xs text-brand-500 mt-1">ระบบทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="w-full space-y-1.5">
          {ORDER.map(key => {
            const count = statusCount[key] ?? 0
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            const c = STATUS_COLORS[key]
            return (
              <div key={key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-50/60">
                <span className="w-4 h-4 rounded-full border-2 border-white shadow shrink-0" style={{ background: c.hex }} />
                <span className="flex-1 text-sm text-slate-700">{STATUS_EMOJI[key]} {key}</span>
                <span className="text-sm font-bold text-brand-900">{count}</span>
                <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}