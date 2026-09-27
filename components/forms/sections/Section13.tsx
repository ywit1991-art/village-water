'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, CheckboxGroup, RadioGroup } from '../FormSection'
import { CK } from '@/lib/constants'

export function Section13() {
  const { register } = useFormContext()

  return (
    <FormSection number={13} title="คุณภาพน้ำประปา">
      <label className="label">ลักษณะน้ำที่ผู้ใช้ได้รับ</label>
      <div className="mb-4">
        <CheckboxGroup
          name="water_quality_appearance"
          options={CK.water_quality_appearance}
        />
      </div>

      <div className="mb-4">
        <label className="label">อื่น ๆ</label>
        <input {...register('water_quality_other')} className="input" />
      </div>

      <label className="label">มีการตรวจสอบคุณภาพน้ำหรือไม่</label>
      <div className="mb-4">
        <RadioGroup name="has_quality_test" options={CK.has_quality_test} />
      </div>

      <div className="mb-4">
        <label className="label">วันที่ตรวจคุณภาพน้ำครั้งล่าสุด</label>
        <input
          type="date"
          {...register('last_quality_test_date')}
          className="input"
        />
      </div>

      <label className="label">ผลการตรวจ/ข้อสังเกต</label>
      <textarea {...register('quality_test_result')} rows={3} className="input" />
    </FormSection>
  )
}