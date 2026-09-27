'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, RadioGroup } from '../FormSection'
import { CK } from '@/lib/constants'

export function Section10() {
  const { register } = useFormContext()

  return (
    <FormSection number={10} title="ข้อมูลผู้ใช้น้ำ">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label">จำนวนครัวเรือนในพื้นที่ (ครัวเรือน)</label>
          <input
            type="number"
            {...register('household_count', { valueAsNumber: true })}
            className="input"
          />
        </div>
        <div>
          <label className="label">จำนวนผู้ใช้น้ำทั้งหมด (ราย)</label>
          <input
            type="number"
            {...register('user_count', { valueAsNumber: true })}
            className="input"
          />
        </div>
        <div>
          <label className="label">มีมิเตอร์วัดน้ำ (ราย)</label>
          <input
            type="number"
            {...register('metered_user_count', { valueAsNumber: true })}
            className="input"
          />
        </div>
        <div>
          <label className="label">ไม่มีมิเตอร์วัดน้ำ (ราย)</label>
          <input
            type="number"
            {...register('unmetered_user_count', { valueAsNumber: true })}
            className="input"
          />
        </div>
      </div>

      <label className="label">มีการจัดทำทะเบียนผู้ใช้น้ำหรือไม่</label>
      <RadioGroup name="has_user_registry" options={CK.has_user_registry} columns={3} />
    </FormSection>
  )
}