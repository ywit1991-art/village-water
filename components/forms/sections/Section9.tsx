'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, CheckboxGroup } from '../FormSection'
import { CK } from '@/lib/constants'

export function Section9() {
  const { register } = useFormContext()

  return (
    <FormSection number={9} title="ระบบท่อส่งน้ำและระบบจ่ายน้ำ">
      <label className="label">วัสดุท่อที่ใช้</label>
      <div className="mb-4">
        <CheckboxGroup
          name="pipe_materials"
          options={CK.pipe_materials}
          columns={4}
        />
      </div>

      <div className="mb-4">
        <label className="label">อื่น ๆ</label>
        <input {...register('pipe_other')} className="input" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label">ขนาดท่อเมน (มม./นิ้ว)</label>
          <input {...register('pipe_main_size')} className="input" />
        </div>
        <div>
          <label className="label">ความยาวท่อโดยประมาณ (ม.)</label>
          <input
            type="number"
            step="any"
            {...register('pipe_total_length', { valueAsNumber: true })}
            className="input"
          />
        </div>
      </div>

      <label className="label">สภาพระบบท่อ</label>
      <div className="mb-4">
        <CheckboxGroup
          name="pipe_condition"
          options={CK.pipe_condition}
          columns={2}
        />
      </div>

      <label className="label">พื้นที่ที่มีปัญหาน้ำประปา</label>
      <textarea {...register('problem_areas')} rows={3} className="input" />
    </FormSection>
  )
}