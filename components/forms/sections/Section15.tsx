'use client'

import { useFormContext } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { OVERALL_CONDITIONS } from '@/lib/constants'

const EMOJI: Record<string, string> = {
  ดี: '✅',
  พอใช้: '⚠️',
  ต้องปรับปรุง: '🔧',
  เร่งด่วน: '🚨',
}

export function Section15() {
  const { register, watch } = useFormContext()
  const current = watch('overall_condition')

  return (
    <FormSection number={15} title="สรุปผลการตรวจสอบข้อมูลประปา">
      <label className="label">สภาพโดยรวมของข้อมูลประปา</label>
      <div className="grid md:grid-cols-2 gap-2 mb-4">
        {OVERALL_CONDITIONS.map(o => {
          const active = current === o.value
          return (
            <label
              key={o.value}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                active
                  ? 'border-brand-500 bg-brand-50/60 shadow-md'
                  : 'border-brand-100 hover:border-brand-300 hover:bg-brand-50/30'
              }`}
            >
              <input
                type="radio"
                value={o.value}
                {...register('overall_condition')}
                className="mt-0.5 accent-brand-500"
              />
              <div>
                <p className="font-medium text-brand-900 text-sm">
                  {EMOJI[o.value]} {o.value}
                </p>
                <p className="text-xs text-brand-600 mt-0.5">
                  {o.label.split('—')[1]?.trim() ?? o.label}
                </p>
              </div>
            </label>
          )
        })}
      </div>

      <label className="label">สรุปผลการตรวจสอบ</label>
      <textarea
        {...register('summary')}
        rows={4}
        className="input"
        placeholder="สรุปภาพรวม ปัญหา และข้อเสนอแนะในภาพรวม..."
      />
    </FormSection>
  )
}