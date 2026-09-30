'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Users,
  Home,
  Droplets,
  DollarSign,
  Phone,
  Calendar,
  Wrench,
} from 'lucide-react'
import { STATUS_COLORS, STATUS_EMOJI } from '@/lib/constants'
import type { WaterSystem, Survey } from '@/lib/types'

interface Props {
  system: WaterSystem
  survey: Survey | null
}

export default function SystemDetailCard({ system, survey }: Props) {
  const [open, setOpen] = useState(false)
  const condition = survey?.overall_condition ?? system.overall_condition ?? 'ไม่มีข้อมูล'
  const c = STATUS_COLORS[condition]

  return (
    <div className="card overflow-hidden">
      {/* Header — คลิกเพื่อขยาย */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-brand-50/40 transition"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5"
            style={{ background: c.hex }}
          >
            {system.system_no}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-brand-900 truncate">
              {system.system_name}
            </h3>
            <p className="text-xs text-brand-500 mt-0.5">
              ข้อมูลที่ {system.system_no}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: `${c.hex}20`,
                  color: c.hex,
                }}
              >
                {STATUS_EMOJI[condition] ?? ''} {condition}
              </span>

              {system.user_count > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                  <Users size={12} /> {system.user_count} ราย
                </span>
              )}
              {system.household_count > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                  <Home size={12} /> {system.household_count} ครัวเรือน
                </span>
              )}
              {system.water_rate && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                  <DollarSign size={12} /> {system.water_rate} บาท/หน่วย
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-brand-400 mt-1">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Content — แสดงเมื่อขยาย */}
      {open && survey && (
        <div className="px-4 pb-4 pt-1 border-t border-brand-50 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoRow
              icon={<Droplets size={14} />}
              label="แหล่งน้ำดิบ"
              value={survey.water_source_name || '–'}
            />
            <InfoRow
              icon={<Users size={14} />}
              label="ผู้ใช้น้ำ"
              value={`${system.user_count ?? 0} ราย`}
            />
            <InfoRow
              icon={<DollarSign size={14} />}
              label="อัตราค่าน้ำ"
              value={system.water_rate ? `${system.water_rate} บาท/หน่วย` : '–'}
            />
            <InfoRow
              icon={<Calendar size={14} />}
              label="ตรวจล่าสุด"
              value={survey.survey_date ?? '–'}
            />
          </div>

          {/* Operator */}
          {survey.operator_name && (
            <div className="p-3 rounded-lg bg-brand-50/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-brand-600 shrink-0">
                <Wrench size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brand-500">ช่างประปา</p>
                <p className="text-sm font-medium text-brand-900 truncate">
                  {survey.operator_name}
                </p>
              </div>
              {survey.operator_phone && (
                <a
                  href={`tel:${survey.operator_phone}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition shrink-0"
                >
                  <Phone size={12} />
                  {survey.operator_phone}
                </a>
              )}
            </div>
          )}

          {/* สรุป */}
          {survey.summary && (
            <div>
              <p className="text-xs font-semibold text-brand-600 mb-1">
                สรุปผลการตรวจสอบ
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {survey.summary}
              </p>
            </div>
          )}

          {/* ปัญหา */}
          {survey.problems && survey.problems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-600 mb-1">
                ปัญหาที่พบ
              </p>
              <ul className="space-y-1">
                {survey.problems.map((p, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-700 flex gap-2"
                  >
                    <span className="text-orange-500 shrink-0">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* รูป */}
          {survey.photos && survey.photos.filter(Boolean).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-brand-600 mb-2">
                ภาพถ่าย ({survey.photos.filter(Boolean).length} ภาพ)
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {survey.photos
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-brand-100 hover:scale-105 transition"
                    >
                      <img
                        src={url}
                        alt={`ภาพที่ ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ไม่มี survey */}
      {open && !survey && (
        <div className="px-4 pb-4 pt-1 border-t border-brand-50">
          <p className="text-sm text-slate-400 text-center py-4">
            ยังไม่มีแบบสำรวจสำหรับข้อมูลนี้
          </p>
        </div>
      )}
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-brand-500">{label}</p>
        <p className="text-sm font-medium text-brand-900 truncate">{value}</p>
      </div>
    </div>
  )
}