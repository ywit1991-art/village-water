'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormSection, RadioGroup } from '../FormSection'
import { CK } from '@/lib/constants'
import { Plus, Trash2 } from 'lucide-react'

export function Section11() {
  const { register, control, watch, getValues } = useFormContext()

  const rateType = watch('water_rate_type') ?? 'flat'

  const tiers = useFieldArray({
    control,
    name: 'water_rate_tiers',
  })

  function addTier() {
    const currentTiers = (getValues('water_rate_tiers') ?? []) as Array<{
      from?: number
      to?: number | null
    }>
    const prev = currentTiers[currentTiers.length - 1]
    const prevTo = prev?.to ? Number(prev.to) : 0
    tiers.append({
      from: prevTo === 0 ? 0 : prevTo + 1,
      to: null,
      rate: 0,
      label: '',
    })
  }

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
            <RadioGroup
              name="meeting_frequency"
              options={CK.meeting_frequency}
            />
          </div>

          <label className="label">มีบัญชีรายรับ-รายจ่ายหรือไม่</label>
          <RadioGroup
            name="has_financial_books"
            options={CK.has_financial_books}
          />
        </div>

        <div>
          <label className="label">มีบัญชีเงินฝากหรือไม่</label>
          <div className="mb-4">
            <RadioGroup
              name="has_bank_account"
              options={CK.has_bank_account}
            />
          </div>

          <label className="label">มีการจัดเก็บค่าน้ำหรือไม่</label>
          <RadioGroup
            name="has_fee_collection"
            options={CK.has_fee_collection}
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* อัตราค่าน้ำ                                    */}
      {/* ============================================ */}
      <div className="border-t border-slate-200 pt-4 mt-2">
        <label className="label font-semibold text-brand-800">
          รูปแบบอัตราค่าน้ำ
        </label>
        <div className="mb-4">
          <RadioGroup
            name="water_rate_type"
            options={[
              { value: 'flat', label: 'อัตราคงที่ (บาท/หน่วย)' },
              { value: 'tiered', label: 'อัตราขั้นบันได' },
              { value: 'by_user_type', label: 'ตามประเภทผู้ใช้' },
            ]}
            columns={3}
          />
        </div>

        {/* ---------- โหมดคงที่ ---------- */}
        {rateType === 'flat' && (
          <div>
            <label className="label">อัตราค่าน้ำ (บาท/หน่วย)</label>
            <input
              type="number"
              step="any"
              {...register('water_rate', { valueAsNumber: true })}
              className="input max-w-xs"
              placeholder="เช่น 10"
            />
          </div>
        )}

        {/* ---------- โหมดขั้นบันได ---------- */}
        {rateType === 'tiered' && (
          <div>
            <label className="label">
              ตารางอัตราขั้นบันได ({tiers.fields.length} ขั้น)
            </label>
            <div className="border border-brand-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-brand-50 text-brand-700">
                  <tr>
                    <th className="p-2 text-left w-12">#</th>
                    <th className="p-2 text-left w-32">จาก (หน่วย)</th>
                    <th className="p-2 text-left w-32">ถึง (หน่วย)</th>
                    <th className="p-2 text-left w-32">บาท/หน่วย</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.fields.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-slate-400 text-sm"
                      >
                        ยังไม่มีขั้นบันได — กด "เพิ่มขั้น" ด้านล่าง
                      </td>
                    </tr>
                  ) : (
                    tiers.fields.map((f, i) => (
                      <tr
                        key={f.id}
                        className="border-t border-brand-100 align-top"
                      >
                        <td className="p-2 text-brand-500 font-medium">
                          {i + 1}
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            {...register(
                              `water_rate_tiers.${i}.from` as const,
                              { valueAsNumber: true },
                            )}
                            className="input"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            {...register(
                              `water_rate_tiers.${i}.to` as const,
                              {
                                setValueAs: v =>
                                  v === '' || v === null ? null : Number(v),
                              },
                            )}
                            className="input"
                            placeholder="ว่าง = ไม่จำกัด"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="any"
                            min={0}
                            {...register(
                              `water_rate_tiers.${i}.rate` as const,
                              { valueAsNumber: true },
                            )}
                            className="input"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => tiers.remove(i)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addTier}
              className="btn-ghost mt-3 text-sm"
            >
              <Plus size={14} /> เพิ่มขั้น
            </button>

            <p className="text-xs text-slate-500 mt-2">
              💡 ตัวอย่าง: 0-5 = 5 บาท, 6-10 = 8 บาท, 11+ = 12 บาท (ช่อง
              "ถึง" ที่ว่าง = ไม่จำกัด)
            </p>
          </div>
        )}

        {/* ---------- โหมดตามประเภทผู้ใช้ ---------- */}
        {rateType === 'by_user_type' && (
          <div>
            <label className="label">อัตราค่าน้ำ (บาท/หน่วย)</label>
            <input
              type="number"
              step="any"
              {...register('water_rate', { valueAsNumber: true })}
              className="input max-w-xs"
              placeholder="เช่น 10"
            />
            <p className="text-xs text-slate-500 mt-2">
              💡 อัตราโดยประมาณ — รายละเอียดแต่ละประเภทให้ระบุในหมายเหตุ
            </p>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* เงินค้างชำระ                                  */}
      {/* ============================================ */}
      <div className="border-t border-slate-200 pt-4 mt-4">
        <label className="label">มีเงินค้างชำระค่าน้ำหรือไม่</label>
        <div className="mb-4">
          <RadioGroup name="has_debt" options={CK.has_debt} columns={3} />
        </div>

        <label className="label">หมายเหตุ (ถ้ามี)</label>
        <textarea
          {...register('debt_notes')}
          rows={2}
          className="input"
        />
      </div>
    </FormSection>
  )
}