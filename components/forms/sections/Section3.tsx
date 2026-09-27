'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { FormSection, CheckboxGroup } from '../FormSection'
import { PhoneInput } from '@/components/ui/phone-input'
import { CK } from '@/lib/constants'

export function Section3() {
  const { register, control } = useFormContext()

  return (
    <FormSection number={3} title="ผู้รับผิดชอบ/ช่างประปา">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">ชื่อ - สกุล</label>
          <input {...register('operator_name')} className="input" />
        </div>
        <div>
          <label className="label">เบอร์โทรศัพท์</label>
          <Controller
            control={control}
            name="operator_phone"
            render={({ field }) => (
              <PhoneInput value={field.value ?? ''} onChange={field.onChange} />
            )}
          />
        </div>
        <div>
          <label className="label">ตำแหน่ง/หน้าที่</label>
          <input {...register('operator_position')} className="input" />
        </div>
        <div>
          <label className="label">ระยะเวลาปฏิบัติหน้าที่ (ปี)</label>
          <input
            type="number"
            step="any"
            {...register('operator_years', { valueAsNumber: true })}
            className="input"
          />
        </div>
      </div>

      <label className="label mt-4">หน้าที่รับผิดชอบ</label>
      <CheckboxGroup name="operator_duties" options={CK.operator_duties} />
    </FormSection>
  )
}