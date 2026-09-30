'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, CheckboxGroup, RadioGroup } from '../FormSection'
import { CK } from '@/lib/constants'

export function Section7() {
  const { register } = useFormContext()

  return (
    <FormSection number={7} title="ข้อมูลผลิตน้ำประปา">
      <label className="label">ประเภทข้อมูลผลิต</label>
      <div className="mb-4">
        <CheckboxGroup
          name="production_type"
          options={CK.production_type}
          columns={2}
        />
      </div>

      <div className="mb-4">
        <label className="label">อื่น ๆ</label>
        <input {...register('production_other')} className="input" />
      </div>

      <label className="label">มีข้อมูลกรองน้ำหรือไม่</label>
      <div className="mb-4">
        <RadioGroup name="has_filter" options={CK.has_filter} columns={3} />
      </div>

      <label className="label">ประเภทข้อมูลกรอง/วัสดุกรอง</label>
      <textarea {...register('filter_type')} rows={2} className="input mb-4" />

      <label className="label">สภาพข้อมูลกรอง</label>
      <div className="mb-4">
        <CheckboxGroup
          name="filter_condition"
          options={CK.filter_condition}
          columns={2}
        />
      </div>

      <label className="label">ข้อมูลฆ่าเชื้อ/เติมคลอรีน</label>
      <RadioGroup name="chlorination" options={CK.chlorination} columns={3} />
    </FormSection>
  )
}