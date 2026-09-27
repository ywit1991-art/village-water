'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection } from '../FormSection'

export function Section1() {
  const { register } = useFormContext()

  return (
    <FormSection number={1} title="ข้อมูลทั่วไป">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">ชื่อระบบประปาหมู่บ้าน</label>
          <input {...register('water_system_name')} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">หน่วยงาน/กลุ่มผู้รับผิดชอบ</label>
          <input {...register('group_name')} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">สถานที่ตั้งระบบประปา</label>
          <input {...register('location')} className="input" />
        </div>
        <div>
          <label className="label">ละติจูด</label>
          <input
            type="number"
            step="any"
            {...register('lat', { valueAsNumber: true })}
            className="input"
            placeholder="19.xxxxxx"
          />
        </div>
        <div>
          <label className="label">ลองจิจูด</label>
          <input
            type="number"
            step="any"
            {...register('lng', { valueAsNumber: true })}
            className="input"
            placeholder="99.xxxxxx"
          />
        </div>
      </div>
    </FormSection>
  )
}