'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormSection, CheckboxGroup } from '../FormSection'
import { Plus, Trash2, Info } from 'lucide-react'
import { CK } from '@/lib/constants'

export function Section5() {
  const { register, control, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'pumps' })

  const pumps = (watch('pumps') as any[]) ?? []

  // คำนวณกำลังผลิตประมาณจาก HP รวม
  const totalHP = pumps.reduce((sum, p) => {
    const hp = parseFloat(String(p?.hp ?? 0))
    return sum + (isNaN(hp) ? 0 : hp)
  }, 0)
  const estimatedCapacity = Math.round(totalHP * 0.5 * 100) / 100

  return (
    <FormSection number={5} title="ข้อมูลสูบน้ำ">
      <label className="label">ประเภทเครื่องสูบน้ำ</label>
      <div className="mb-4">
        <CheckboxGroup name="pump_types" options={CK.pump_types} />
      </div>

      <div className="mb-4">
        <label className="label">จำนวนเครื่องสูบน้ำ (เครื่อง)</label>
        <input
          type="number"
          {...register('pump_count', { valueAsNumber: true })}
          className="input max-w-xs"
        />
      </div>

      <label className="label">รายละเอียดเครื่องสูบน้ำ</label>
      <div className="space-y-3">
        {fields.map((f, i) => (
          <div
            key={f.id}
            className="border border-brand-100 rounded-lg p-3 bg-brand-50/30"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-brand-800 text-sm">
                เครื่องที่ {i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-500 hover:text-red-700 active:scale-95 transition"
                aria-label={`ลบเครื่องที่ ${i + 1}`}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-2 mb-2">
              <input
                placeholder="ยี่ห้อ"
                {...register(`pumps.${i}.brand`)}
                className="input"
              />
              <input
                placeholder="รุ่น"
                {...register(`pumps.${i}.model`)}
                className="input"
              />
              <input
                placeholder="ขนาด (แรงม้า)"
                {...register(`pumps.${i}.hp`)}
                className="input"
              />
              <input
                placeholder="อายุ (ปี)"
                {...register(`pumps.${i}.age`)}
                className="input"
              />
            </div>

            <div className="grid md:grid-cols-4 gap-1">
              {[
                'ปกติ',
                'ทำงานได้แต่ประสิทธิภาพลดลง',
                'ชำรุดบางส่วน',
                'ชำรุดใช้งานไม่ได้',
              ].map(c => (
                <label
                  key={c}
                  className="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-white cursor-pointer active:scale-95 transition"
                >
                  <input
                    type="radio"
                    value={c}
                    {...register(`pumps.${i}.condition`)}
                    className="accent-brand-500 w-4 h-4"
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          append({ brand: '', model: '', hp: '', age: '', condition: '' })
        }
        className="btn-ghost mt-3 text-sm"
      >
        <Plus size={16} /> เพิ่มเครื่องสูบน้ำ
      </button>

      {/* ⭐ กำลังการผลิต */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <label className="label font-semibold text-brand-800">
          กำลังการผลิตรวมของระบบ (ลบ.ม./ชม.) *
        </label>
        <div className="grid md:grid-cols-2 gap-4 items-end">
          <div>
            <input
              type="number"
              step="any"
              {...register('production_capacity', { valueAsNumber: true })}
              className="input"
              placeholder="เช่น 7"
            />
            <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                ดูได้จากสเปกปั๊ม หรือคำนวณจาก{' '}
                <strong>แรงม้ารวม × 0.5</strong>
              </span>
            </p>
          </div>

          {totalHP > 0 && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-3">
              <p className="text-xs text-brand-700 mb-1">
                💡 ค่าประมาณจากปั๊ม (รวม {totalHP} แรงม้า):
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-brand-900 tabular-nums">
                  {estimatedCapacity}
                </span>
                <span className="text-sm text-brand-600">ลบ.ม./ชม.</span>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>(
                      'input[name="production_capacity"]',
                    )
                    if (input) {
                      input.value = String(estimatedCapacity)
                      input.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                  }}
                  className="ml-auto text-xs px-2.5 py-1 rounded bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-medium transition"
                >
                  ใช้ค่านี้
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  )
}