'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, CheckboxGroup, RadioGroup } from '../FormSection'
import { CK } from '@/lib/constants'

export function Section6() {
  const { register } = useFormContext()

  return (
    <FormSection number={6} title="ระบบไฟฟ้าและตู้ควบคุม">
      <label className="label">ระบบไฟฟ้า</label>
      <div className="mb-4">
        <RadioGroup name="electrical_phase" options={CK.electrical_phase} />
      </div>

      <div className="mb-4">
        <label className="label">หมายเลขมิเตอร์ไฟฟ้า</label>
        <input {...register('electrical_meter_no')} className="input" />
      </div>

      <label className="label">สภาพตู้ควบคุมไฟฟ้า</label>
      <div className="mb-4">
        <CheckboxGroup
          name="control_box_condition"
          options={CK.control_box_condition}
          columns={2}
        />
      </div>

      <div className="mb-4">
        <label className="label">อื่น ๆ</label>
        <input {...register('control_box_other')} className="input" />
      </div>

      <label className="label">ระบบสายไฟ/อุปกรณ์ไฟฟ้า</label>
      <div className="mb-4">
        <RadioGroup
          name="electrical_wiring_condition"
          options={CK.electrical_wiring_condition}
          columns={3}
        />
      </div>

      <label className="label">ข้อสังเกต</label>
      <textarea {...register('electrical_notes')} rows={2} className="input" />
    </FormSection>
  )
}