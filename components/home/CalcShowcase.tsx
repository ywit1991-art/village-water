'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Droplets,
  Calculator,
  Database,
  BookOpen,
  Home,
  Package,
  Info,
  TrendingUp,
} from 'lucide-react'

const STEPS = [
  {
    icon: Users,
    color: 'sky',
    title: 'จำนวนผู้ใช้น้ำ',
    formula: 'ครัวเรือน × 5 คน',
    example: '100 ครัวเรือน = 500 คน',
    source: 'ค่ามาตรฐานชนบท',
  },
  {
    icon: Droplets,
    color: 'indigo',
    title: 'ความต้องการน้ำ',
    formula: 'คน × 50 ลิตร × 1.5',
    example: '500 × 50 × 1.5 = 37.5 ลบ.ม./วัน',
    source: 'กรมทรัพยากรน้ำ',
  },
  {
    icon: Calculator,
    color: 'emerald',
    title: 'กำลังผลิตที่ต้องการ',
    formula: 'ความต้องการ ÷ 14 ชม.',
    example: '37.5 ÷ 14 = 2.68 ลบ.ม./ชม.',
    source: 'ระบบประปาหมู่บ้าน 14 ชม./วัน',
  },
  {
    icon: Database,
    color: 'amber',
    title: 'เปรียบเทียบกับจริง',
    formula: 'ผลิตจริง ÷ ต้องการ × 100',
    example: '7 ÷ 2.68 = 261%',
    source: 'ข้อมูลปั๊มที่กรอก',
  },
  {
    icon: BookOpen,
    color: 'rose',
    title: 'ตรวจถังเก็บน้ำ',
    formula: 'ถังจริง ÷ (PDD × 1/3) × 100',
    example: '12 ÷ 12.5 = 96%',
    source: 'มาตรฐานขั้นต่ำ 1/3 PDD',
  },
]

const COLOR_MAP = {
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    icon: 'text-sky-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: 'text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'text-amber-600',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: 'text-rose-600',
  },
} as const

export function CalcShowcase() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 py-12 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-brand-900">
          เราคำนวณความเพียงพอของน้ำอย่างไร?
        </h2>
        <p className="text-sm md:text-base text-slate-500 mt-2 max-w-2xl mx-auto leading-relaxed">
          ระบบประเมินว่าแต่ละจุดประปามีน้ำเพียงพอต่อการใช้งานหรือไม่
          โดยอ้างอิงจากทฤษฎีและมาตรฐานของหน่วยงานภาครัฐ
        </p>
      </motion.div>

      {/* 5 Steps */}
      <div className="grid md:grid-cols-5 gap-3 md:gap-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const c = COLOR_MAP[step.color as keyof typeof COLOR_MAP]

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative bg-white rounded-2xl p-4 border-2 ${c.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all`}
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                {i + 1}
              </div>

              <div
                className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-3 ${c.bg}`}
              >
                <Icon size={20} className={c.icon} />
              </div>

              <h3 className={`text-sm font-bold ${c.text} mb-2 leading-tight`}>
                {step.title}
              </h3>

              <div className="space-y-1.5">
                <div className="bg-slate-50 rounded-md px-2 py-1.5">
                  <p className="text-[10px] text-slate-500 font-medium">
                    สูตร
                  </p>
                  <p className="text-[11px] font-mono text-slate-800 leading-tight">
                    {step.formula}
                  </p>
                </div>

                <div className={`${c.bg} rounded-md px-2 py-1.5`}>
                  <p className="text-[10px] text-slate-600 font-medium">
                    ตัวอย่าง
                  </p>
                  <p
                    className={`text-[11px] font-semibold ${c.text} leading-tight`}
                  >
                    {step.example}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Example Calculation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 bg-white rounded-2xl border-2 border-brand-200 overflow-hidden shadow-md"
      >
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                ตัวอย่างการคำนวณจริง
              </h3>
              <p className="text-xs text-brand-100">
                100 ครัวเรือน · ระบบประปาบาดาล · ปั๊ม 5 แรงม้า
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <h4 className="text-sm font-bold text-brand-900 mb-3 flex items-center gap-2">
                <Home size={16} className="text-brand-600" />
                ข้อมูลนำเข้า
              </h4>
              <div className="space-y-2">
                <InputRow label="ครัวเรือน" value="100 หลัง" />
                <InputRow label="คนต่อครัวเรือน" value="5 คน" />
                <InputRow label="อัตราการใช้น้ำ" value="50 ลิตร/คน/วัน" />
                <InputRow label="Peak Factor (ฤดูแล้ง)" value="× 1.5" />
                <InputRow label="ชั่วโมงทำงานระบบ" value="14 ชม./วัน" />
                <InputRow label="กำลังผลิตปั๊ม" value="5 แรงม้า ≈ 2.5 ลบ.ม./ชม." highlight />
                <InputRow label="ความจุถังเก็บ" value="12 ลบ.ม." highlight />
              </div>
            </div>

            {/* Output */}
            <div>
              <h4 className="text-sm font-bold text-brand-900 mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                ผลการคำนวณ
              </h4>
              <div className="space-y-2">
                <OutputRow
                  label="จำนวนผู้ใช้น้ำ"
                  formula="100 × 5"
                  value="500 คน"
                />
                <OutputRow
                  label="ความต้องการน้ำ (PDD)"
                  formula="500 × 50 × 1.5 ÷ 1000"
                  value="37.5 ลบ.ม./วัน"
                />
                <OutputRow
                  label="กำลังผลิตที่ต้องการ"
                  formula="37.5 ÷ 14"
                  value="2.68 ลบ.ม./ชม."
                />
                <OutputRow
                  label="กำลังผลิตจริงต่อวัน"
                  formula="2.5 × 14"
                  value="35 ลบ.ม./วัน"
                  highlight
                  highlightColor="text-amber-600"
                />
                <OutputRow
                  label="ถังเก็บที่ต้องการ (1/3 PDD)"
                  formula="37.5 × 1/3"
                  value="12.5 ลบ.ม."
                />
              </div>

              {/* Ratio */}
              <div className="mt-4 space-y-2">
                <RatioRow
                  label="อัตราส่วนกำลังผลิต"
                  formula="35 ÷ 37.5 × 100"
                  value="93%"
                  status="พอใช้"
                  color="yellow"
                />
                <RatioRow
                  label="อัตราส่วนถังเก็บ"
                  formula="12 ÷ 12.5 × 100"
                  value="96%"
                  status="พอใช้"
                  color="yellow"
                />
              </div>

              {/* Final Result */}
              <div className="mt-4 p-3 rounded-xl bg-yellow-50 border-2 border-yellow-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-yellow-700">
                      สรุปผล
                    </p>
                    <p className="text-base font-bold text-yellow-800">
                      พอใช้ · 93%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8 bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
            <BookOpen size={20} className="text-brand-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-brand-900 mb-2">
              📖 แหล่งอ้างอิงทางวิชาการ
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="text-brand-500 shrink-0">•</span>
                <span>
                  <strong>อัตราการใช้น้ำ 50 ลิตร/คน/วัน</strong> —
                  กรมทรัพยากรน้ำ กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500 shrink-0">•</span>
                <span>
                  <strong>Peak Day Factor ฤดูแล้ง 1.5</strong> —
                  มาตรฐานการประปาส่วนภูมิภาค
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500 shrink-0">•</span>
                <span>
                  <strong>จำนวนคนต่อครัวเรือน 5 คน</strong> —
                  คู่มือออกแบบระบบประปาหมู่บ้าน กรมทรัพยากรน้ำ
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500 shrink-0">•</span>
                <span>
                  <strong>เวลาทำงาน 14 ชม./วัน</strong> — ค่ามาตรฐานระบบ
                  ประปาหมู่บ้านขนาดกลาง
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500 shrink-0">•</span>
                <span>
                  <strong>ถังเก็บน้ำ ≥ 1/3 ของ PDD</strong> — มาตรฐานขั้นต่ำ
                  ระบบประปาหมู่บ้าน
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-brand-100">
          <p className="text-xs font-semibold text-brand-700 mb-3">
            เกณฑ์การประเมินความเพียงพอ:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              {
                emoji: '💧',
                label: 'เพียงพอ',
                range: '≥ 900%',
                color:
                  'bg-blue-50 text-blue-900 border-blue-300',
                dotColor: '#0c2b90',
              },
              {
                emoji: '💧',
                label: 'พอใช้',
                range: '70-89%',
                color:
                  'bg-blue-50 text-blue-800 border-blue-200',
                dotColor: '#3b82f6',
              },
              {
                emoji: '💧',
                label: 'ไม่เพียงพอ',
                range: '50-69%',
                color:
                  'bg-sky-50 text-sky-800 border-sky-300',
                dotColor: '#bae6fd',
              },
              {
                emoji: '💧',
                label: 'วิกฤต',
                range: '< 50%',
                color:
                  'bg-slate-100 text-slate-700 border-slate-300',
                dotColor: '#94a3b8',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`rounded-lg border ${item.color} px-3 py-2 text-center`}
              >
                <div
                  className="w-6 h-6 rounded-full mx-auto mb-1 border-2 border-white shadow-sm"
                  style={{ background: item.dotColor }}
                />
                <p className="text-[11px] font-semibold mt-1">{item.label}</p>
                <p className="text-[10px] opacity-80">{item.range}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ============================================================ */
/* SUB COMPONENTS                                                */
/* ============================================================ */

function InputRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
      <span className="text-slate-600">{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          highlight ? 'text-brand-700' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function OutputRow({
  label,
  formula,
  value,
  highlight,
  highlightColor,
}: {
  label: string
  formula: string
  value: string
  highlight?: boolean
  highlightColor?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs py-1.5 px-3 rounded-lg bg-brand-50/50 border border-brand-100">
      <div className="min-w-0 flex-1">
        <p className="text-slate-700 font-medium truncate">{label}</p>
        <p className="text-[10px] text-slate-400 font-mono truncate">
          {formula}
        </p>
      </div>
      <span
        className={`font-bold tabular-nums shrink-0 ${
          highlightColor ?? 'text-brand-700'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function RatioRow({
  label,
  formula,
  value,
  status,
  color,
}: {
  label: string
  formula: string
  value: string
  status: string
  color: 'green' | 'yellow' | 'orange' | 'red'
}) {
  const colorMap = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  }
  return (
    <div
      className={`flex items-center justify-between gap-2 text-xs py-2 px-3 rounded-lg border ${colorMap[color]}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{label}</p>
        <p className="text-[10px] opacity-70 font-mono truncate">{formula}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold tabular-nums text-base">{value}</p>
        <p className="text-[10px] opacity-80">{status}</p>
      </div>
    </div>
  )
}