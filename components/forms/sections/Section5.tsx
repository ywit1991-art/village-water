'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormSection, CheckboxGroup } from '../FormSection'
import { Plus, Trash2 } from 'lucide-react'
import { CK } from '@/lib/constants'

export function Section5() {
  const { register, control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'pumps' })

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
          className="input"
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
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-2 mb-2">
              <input placeholder="ยี่ห้อ" {...register(`pumps.${i}.brand`)} className="input" />
              <input placeholder="รุ่น" {...register(`pumps.${i}.model`)} className="input" />
              <input placeholder="ขนาด (แรงม้า)" {...register(`pumps.${i}.hp`)} className="input" />
              <input placeholder="อายุ (ปี)" {...register(`pumps.${i}.age`)} className="input" />
            </div>

            <div className="grid md:grid-cols-4 gap-1">
              {['ปกติ', 'ทำงานได้แต่ประสิทธิภาพลดลง', 'ชำรุดบางส่วน', 'ชำรุดใช้งานไม่ได้'].map(c => (
                <label
                  key={c}
                  className="flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-white cursor-pointer"
                >
                  <input
                    type="radio"
                    value={c}
                    {...register(`pumps.${i}.condition`)}
                    className="accent-brand-500"
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
        onClick={() => append({ brand: '', model: '', hp: '', age: '', condition: '' })}
        className="btn-ghost mt-3"
      >
        <Plus size={16} /> เพิ่มเครื่องสูบน้ำ
      </button>
    </FormSection>
  )
}