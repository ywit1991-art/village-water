'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { PhoneInput } from '@/components/ui/phone-input'
import { Controller } from 'react-hook-form'

const SIGN_ROLES = [
  { key: 'informant', label: 'ผู้ให้ข้อมูล/ผู้แทนคณะกรรมการ', dept: '' },
  {
    key: 'inspector',
    label: 'เจ้าหน้าที่ผู้ตรวจสอบ',
    dept: 'กองช่าง เทศบาลตำบลท่าวังทอง',
  },
  { key: 'witness', label: 'ผู้ตรวจสอบ/ผู้ร่วมตรวจ', dept: '' },
]

export function Section17() {
  const { register, control } = useFormContext()

  return (
    <FormSection number={17} title="การรับรองข้อมูล">
      <div className="mb-4 p-4 bg-brand-50/50 border border-brand-100 rounded-lg">
        <p className="text-xs text-brand-700 leading-relaxed">
          ข้าพเจ้าขอรับรองว่าข้อมูลที่ให้ไว้ในแบบตรวจสอบข้อมูลประปาหมู่บ้านฉบับนี้
          เป็นข้อมูลตามสภาพข้อเท็จจริงที่สามารถตรวจสอบได้ ณ วัน ที่ลงพื้นที่สำรวจ
        </p>
      </div>

      <div className="space-y-4">
        {SIGN_ROLES.map((role, i) => (
          <div
            key={role.key}
            className="border border-brand-100 rounded-lg p-4 bg-white"
          >
            <p className="text-sm font-medium text-brand-800 mb-3">
              {role.label}{' '}
              {role.dept && (
                <span className="text-brand-500 font-normal">
                  ({role.dept})
                </span>
              )}
            </p>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">ชื่อ - สกุล</label>
                <input
                  {...register(`signatures.${i}.name`)}
                  className="input"
                  placeholder="นาย/นาง/นางสาว..."
                />
              </div>

              <div>
                <label className="label text-xs">เบอร์โทรศัพท์</label>
                <Controller
                  control={control}
                  name={`signatures.${i}.phone`}
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div>
                <label className="label text-xs">ตำแหน่ง</label>
                <input
                  {...register(`signatures.${i}.position`)}
                  className="input"
                />
              </div>

              <div className="md:col-span-3">
                <label className="label text-xs">วันที่</label>
                <input
                  type="date"
                  {...register(`signatures.${i}.date`)}
                  className="input"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  )
}