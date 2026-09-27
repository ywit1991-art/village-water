'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection, RadioGroup } from '../FormSection'
import { CK } from '@/lib/constants'

export function Section11() {
  const { register } = useFormContext()

  return (
    <FormSection number={11} title="การบริหารจัดการกิจการประปา">
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="label">มีระเบียบ/ข้อบังคับการใช้หรือไม่</label>
          <div className="mb-4">
            <RadioGroup name="has_regulations" options={CK.has_regulations} />
          </div>

          <label className="label">การประชุมคณะกรรมการ</label>
          <div className="mb-4">
            <RadioGroup name="meeting_frequency" options={CK.meeting_frequency} />
          </div>

          <label className="label">มีบัญชีรายรับ-รายจ่ายหรือไม่</label>
          <RadioGroup name="has_financial_books" options={CK.has_financial_books} />
        </div>

        <div>
          <label className="label">มีบัญชีเงินฝากหรือไม่</label>
          <div className="mb-4">
            <RadioGroup name="has_bank_account" options={CK.has_bank_account} />
          </div>

          <label className="label">มีการจัดเก็บค่าน้ำหรือไม่</label>
          <div className="mb-4">
            <RadioGroup name="has_fee_collection" options={CK.has_fee_collection} />
          </div>

          <label className="label">อัตราค่าน้ำ (บาท/หน่วย)</label>
          <input
            type="number"
            step="any"
            {...register('water_rate', { valueAsNumber: true })}
            className="input"
          />
        </div>
      </div>

      <label className="label">มีเงินค้างชำระค่าน้ำหรือไม่</label>
      <div className="mb-4">
        <RadioGroup name="has_debt" options={CK.has_debt} columns={3} />
      </div>

      <label className="label">หมายเหตุ (ถ้ามี)</label>
      <textarea {...register('debt_notes')} rows={2} className="input" />
    </FormSection>
  )
}