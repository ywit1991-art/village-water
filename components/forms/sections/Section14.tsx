'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { Plus, Trash2 } from 'lucide-react'

export function Section14() {
  const { register, control } = useFormContext()

  const problems = useFieldArray({ control, name: 'problems' })
  const improvements = useFieldArray({ control, name: 'improvements' })

  return (
    <FormSection number={14} title="ปัญหาและข้อเสนอแนะจากการตรวจสอบ">
      {/* ปัญหาที่พบ */}
      <div className="mb-6">
        <label className="label">ปัญหาที่พบ</label>
        <div className="space-y-2">
          {problems.fields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <span className="w-6 text-brand-600 text-sm pt-2">{i + 1}.</span>
              <input
                {...register(`problems.${i}`)}
                className="input flex-1"
                placeholder="ระบุปัญหา..."
              />
              <button
                type="button"
                onClick={() => problems.remove(i)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => problems.append('')}
          className="btn-ghost mt-2 text-sm"
        >
          <Plus size={14} /> เพิ่มปัญหา
        </button>
      </div>

      {/* จุดที่ควรแก้ไข */}
      <div className="mb-6">
        <label className="label">จุดที่ควรดำเนินการแก้ไข/ปรับปรุง</label>
        <div className="space-y-2">
          {improvements.fields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <span className="w-6 text-brand-600 text-sm pt-2">{i + 1}.</span>
              <input
                {...register(`improvements.${i}`)}
                className="input flex-1"
                placeholder="ระบุสิ่งที่ควรปรับปรุง..."
              />
              <button
                type="button"
                onClick={() => improvements.remove(i)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => improvements.append('')}
          className="btn-ghost mt-2 text-sm"
        >
          <Plus size={14} /> เพิ่มรายการ
        </button>
      </div>

      {/* ข้อเสนอแนะคณะกรรมการ */}
      <label className="label">ข้อเสนอแนะของคณะกรรมการบริหารกิจการประปา</label>
      <textarea
        {...register('committee_suggestions')}
        rows={4}
        className="input"
      />
    </FormSection>
  )
}