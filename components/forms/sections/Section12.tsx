'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { CK, MAINTENANCE_ITEMS } from '@/lib/constants'

export function Section12() {
  const { register, watch, setValue } = useFormContext()

  return (
    <FormSection number={12} title="การบำรุงรักษาระบบ">
      <label className="label">มีการบำรุงรักษาระบบเป็นประจำหรือไม่</label>
      <div className="grid md:grid-cols-2 gap-1 mb-4">
        {CK.has_maintenance.map(opt => {
          const checked = watch('has_maintenance') === opt
          return (
            <label
              key={opt}
              className={`flex items-start gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-sm transition ${
                checked
                  ? 'bg-brand-50 ring-1 ring-brand-200'
                  : 'hover:bg-brand-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  setValue('has_maintenance', checked ? '' : opt, {
                    shouldDirty: true,
                  })
                }}
                className="accent-brand-500 mt-0.5"
              />
              <span>{opt}</span>
            </label>
          )
        })}
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
            {MAINTENANCE_ITEMS.map(item => {
              const current = watch(`maintenance_items.${item}.status`)
              const has = current === 'มี'
              const none = current === 'ไม่มี'

              return (
                <tr key={item} className="border-t border-brand-100">
                  <td className="p-2 text-brand-900">{item}</td>

                  {/* คอลัมน์ "มี" — checkbox */}
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={has}
                      onChange={() => {
                        setValue(
                          `maintenance_items.${item}.status`,
                          has ? '' : 'มี',
                          { shouldDirty: true },
                        )
                      }}
                      className="accent-brand-500 w-5 h-5 cursor-pointer"
                    />
                  </td>

                  {/* คอลัมน์ "ไม่มี" — checkbox */}
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={none}
                      onChange={() => {
                        setValue(
                          `maintenance_items.${item}.status`,
                          none ? '' : 'ไม่มี',
                          { shouldDirty: true },
                        )
                      }}
                      className="accent-brand-500 w-5 h-5 cursor-pointer"
                    />
                  </td>

                  {/* หมายเหตุ */}
                  <td className="p-2">
                    <input
                      {...register(`maintenance_items.${item}.note`)}
                      className="input"
                      placeholder="—"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </FormSection>
  )
}