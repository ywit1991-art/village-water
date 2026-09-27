'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, CheckboxGroup } from '../FormSection'
import { CK } from '@/lib/constants'

export function Section8() {
  const { register } = useFormContext()

  return (
    <FormSection number={8} title="ถังเก็บน้ำ/ถังสูง">
      <label className="label">ประเภทถัง</label>
      <div className="mb-4">
        <CheckboxGroup name="tank_types" options={CK.tank_types} />
      </div>

      <div className="mb-4">
        <label className="label">อื่น ๆ</label>
        <input {...register('tank_other')} className="input" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label">จำนวน (ถัง)</label>
          <input
            type="number"
            {...register('tank_count', { valueAsNumber: true })}
            className="input"
          />
        </div>
        <div>
          <label className="label">ความจุรวม (ลบ.ม.)</label>
          <input
            type="number"
            step="any"
            {...register('tank_capacity', { valueAsNumber: true })}
            className="input"
          />
        </div>
      </div>

      <label className="label">สภาพถังเก็บน้ำ</label>
      <div className="mb-4">
        <CheckboxGroup
          name="tank_condition"
          options={CK.tank_condition}
          columns={2}
        />
      </div>

      <label className="label">สภาพพื้นที่โดยรอบ</label>
      <div className="mb-4">
        <CheckboxGroup
          name="tank_surrounding"
          options={CK.tank_surrounding}
          columns={3}
        />
      </div>

      <label className="label">ข้อสังเกต</label>
      <textarea {...register('tank_notes')} rows={2} className="input" />
    </FormSection>
  )
}