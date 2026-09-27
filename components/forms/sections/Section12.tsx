'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, RadioGroup } from '../FormSection'
import { CK, MAINTENANCE_ITEMS } from '@/lib/constants'

export function Section12() {
  const { register } = useFormContext()

  return (
    <FormSection number={12} title="การบำรุงรักษาระบบ">
      <label className="label">มีการบำรุงรักษาระบบเป็นประจำหรือไม่</label>
      <div className="mb-4">
        <RadioGroup name="has_maintenance" options={CK.has_maintenance} />
      </div>

      <label className="label">รายการบำรุงรักษา</label>
      <div className="border border-brand-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-700">
            <tr>
              <th className="p-2 text-left">รายการ</th>
              <th className="p-2 w-20 text-center">มี</th>
              <th className="p-2 w-20 text-center">ไม่มี</th>
              <th className="p-2 w-48 text-left">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {MAINTENANCE_ITEMS.map(item => (
              <tr key={item} className="border-t border-brand-100">
                <td className="p-2 text-brand-900">{item}</td>
                <td className="p-2 text-center">
                  <input
                    type="radio"
                    value="มี"
                    {...register(`maintenance_items.${item}.status`)}
                    className="accent-brand-500"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="radio"
                    value="ไม่มี"
                    {...register(`maintenance_items.${item}.status`)}
                    className="accent-brand-500"
                  />
                </td>
                <td className="p-2">
                  <input
                    {...register(`maintenance_items.${item}.note`)}
                    className="input"
                    placeholder="—"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FormSection>
  )
}