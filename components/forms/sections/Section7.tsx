'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, CheckboxGroup, RadioGroup } from '../FormSection'
import { CK } from '@/lib/constants'

export function Section7() {
  const { register } = useFormContext()

  return (
    <FormSection number={7} title="ระบบผลิตน้ำประปา">
      <label className="label">ประเภทระบบผลิต</label>
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

      <label className="label">มีระบบกรองน้ำหรือไม่</label>
      <div className="mb-4">
        <RadioGroup name="has_filter" options={CK.has_filter} columns={3} />
      </div>

      <label className="label">ประเภทระบบกรอง/วัสดุกรอง</label>
      <textarea {...register('filter_type')} rows={2} className="input mb-4" />

      <label className="label">สภาพระบบกรอง</label>
      <div className="mb-4">
        <CheckboxGroup
          name="filter_condition"
          options={CK.filter_condition}
          columns={2}
        />
      </div>

      <label className="label">ระบบฆ่าเชื้อ/เติมคลอรีน</label>
      <RadioGroup name="chlorination" options={CK.chlorination} columns={3} />
    </FormSection>
  )
}