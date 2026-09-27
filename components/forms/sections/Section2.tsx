'use client'

import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { FormSection, RadioGroup } from '../FormSection'
import { PhoneInput } from '@/components/ui/phone-input'
import { Trash2, Plus } from 'lucide-react'
import { CK } from '@/lib/constants'

export function Section2() {
  const { register, control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'committee_members',
  })

  return (
    <FormSection number={2} title="คณะกรรมการบริหารกิจการประปา">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label">คำสั่ง/ประกาศแต่งตั้ง เลขที่</label>
          <input {...register('committee_order_no')} className="input" />
        </div>
        <div>
          <label className="label">ลงวันที่</label>
          <input type="date" {...register('committee_order_date')} className="input" />
        </div>
        <div>
          <label className="label">วันเริ่มปฏิบัติหน้าที่</label>
          <input type="date" {...register('committee_start_date')} className="input" />
        </div>
        <div>
          <label className="label">วาระ (ปี)</label>
          <input {...register('committee_term')} className="input" />
        </div>
      </div>

      <label className="label">สถานะคณะกรรมการ</label>
      <div className="mb-4">
        <RadioGroup name="committee_status" options={CK.committee_status} />
      </div>

      <label className="label mt-2">รายชื่อคณะกรรมการ</label>
      <div className="border border-brand-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-700">
            <tr>
              <th className="p-2 text-left w-10">#</th>
              <th className="p-2 text-left">ชื่อ - สกุล</th>
              <th className="p-2 text-left w-44">เบอร์โทรศัพท์</th>
              <th className="p-2 text-left w-40">ตำแหน่ง</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.id} className="border-t border-brand-100 align-top">
                <td className="p-2 text-brand-500">{i + 1}</td>
                <td className="p-2">
                  <input
                    {...register(`committee_members.${i}.name`)}
                    className="input"
                    placeholder="นาย/นาง/นางสาว..."
                  />
                </td>
                <td className="p-2">
                  <Controller
                    control={control}
                    name={`committee_members.${i}.phone`}
                    render={({ field }) => (
                      <PhoneInput value={field.value ?? ''} onChange={field.onChange} />
                    )}
                  />
                </td>
                <td className="p-2">
                  <input
                    {...register(`committee_members.${i}.position`)}
                    className="input"
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => append({ name: '', position: '', phone: '' })}
        className="btn-ghost mt-3"
      >
        <Plus size={16} /> เพิ่มกรรมการ
      </button>
    </FormSection>
  )
}