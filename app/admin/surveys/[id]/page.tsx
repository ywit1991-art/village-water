'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

import { Section1 } from '@/components/forms/sections/Section1'
import { Section2 } from '@/components/forms/sections/Section2'
import { Section3 } from '@/components/forms/sections/Section3'
import { Section4 } from '@/components/forms/sections/Section4'
import { Section5 } from '@/components/forms/sections/Section5'
import { Section6 } from '@/components/forms/sections/Section6'
import { Section7 } from '@/components/forms/sections/Section7'
import { Section8 } from '@/components/forms/sections/Section8'
import { Section9 } from '@/components/forms/sections/Section9'
import { Section10 } from '@/components/forms/sections/Section10'
import { Section11 } from '@/components/forms/sections/Section11'
import { Section12 } from '@/components/forms/sections/Section12'
import { Section13 } from '@/components/forms/sections/Section13'
import { Section14 } from '@/components/forms/sections/Section14'
import { Section15 } from '@/components/forms/sections/Section15'
import { Section16 } from '@/components/forms/sections/Section16'
import { Section17 } from '@/components/forms/sections/Section17'

export default function SurveyFormPage() {
  const router = useRouter()
  const params = useParams()
  const search = useSearchParams()
  const id = params.id as string
  const villageId = Number(search.get('village') ?? 0)
  const systemId = Number(search.get('system') ?? 0)
  const isNew = id === 'new'

  const methods = useForm({
    defaultValues: {
      village_id: villageId,
      water_system_id: systemId || null,
      status: 'draft',
      photos: [],  
      committee_members: [],
      operator_duties: [],
      water_source_type: [],
      water_source_condition: [],
      pump_types: [],
      pumps: [],
      control_box_condition: [],
      production_type: [],
      filter_condition: [],
      tank_types: [],
      tank_condition: [],
      tank_surrounding: [],
      pipe_materials: [],
      pipe_condition: [],
      water_quality_appearance: [],
      problems: [],
      improvements: [],
      maintenance_items: {},
      signatures: [
        { name: '', phone: '', position: '', date: '' },
        { name: '', phone: '', position: '', date: '' },
        { name: '', phone: '', position: '', date: '' },
      ],
    },
  })

  const [village, setVillage] = useState<{
    village_no: number
    village_name: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const sb = createClient()

      const { data: v } = await sb
        .from('villages')
        .select('village_no, village_name')
        .eq('id', villageId)
        .single()
      setVillage(v)

      if (!isNew) {
        const { data: s } = await sb
          .from('surveys')
          .select('*')
          .eq('id', id)
          .single()
        if (s) methods.reset(s)
      }

      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, villageId])

  async function save(status: 'draft' | 'submitted') {
    const values = methods.getValues()
    const sb = createClient()
    const {
      data: { user },
    } = await sb.auth.getUser()

    const cleaned = cleanPayload(values)
    const payload = { ...cleaned, status, created_by: user?.id }

    const query = isNew
      ? sb.from('surveys').insert(payload)
      : sb.from('surveys').update(payload).eq('id', id)

    const { error } = await query
    if (error) {
      toast.error('บันทึกไม่สำเร็จ: ' + error.message)
      return
    }
    toast.success(status === 'draft' ? 'บันทึกร่างแล้ว' : 'ส่งข้อมูลสำเร็จ')
    router.push('/admin/dashboard')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-50/40">
      <header className="sticky top-0 z-30 bg-white border-b border-brand-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <p className="text-xs text-brand-500">
            {village && `หมู่ ${village.village_no}`}
          </p>
          <h1 className="font-bold text-brand-900">
            {isNew ? 'บันทึกแบบสำรวจใหม่' : 'แก้ไขแบบสำรวจ'} —{' '}
            {village?.village_name}
          </h1>
        </div>
      </header>

      <FormProvider {...methods}>
        <form
          className="max-w-4xl mx-auto px-4 py-6 space-y-6"
          onSubmit={methods.handleSubmit(() => save('submitted'))}
        >
          <Section1 />
          <Section2 />
          <Section3 />
          <Section4 />
          <Section5 />
          <Section6 />
          <Section7 />
          <Section8 />
          <Section9 />
          <Section10 />
          <Section11 />
          <Section12 />
          <Section13 />
          <Section14 />
          <Section15 />
          <Section16 />
          <Section17 />

          <div className="card p-4 flex flex-wrap items-center gap-3 sticky bottom-4 z-20">
            <button
              type="button"
              onClick={() => save('draft')}
              className="btn-ghost"
            >
              บันทึกร่าง
            </button>
            <button type="submit" className="btn-primary">
              บันทึกและส่ง
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-ghost ml-auto"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

// ========================================
// Helper: ล้างค่า "" และ NaN ก่อนส่ง Supabase
// (อยู่ข้างนอก component)
// ========================================
// ========================================
// Helper: ล้างค่า "" และ NaN + clamp ค่าตัวเลขให้พอดีกับ DB
// ========================================
const NUMERIC_LIMITS: Record<string, { min?: number; max?: number; decimals?: number }> = {
  // พิกัด — numeric(10,7) → max 999.9999999
  lat: { min: -90, max: 90, decimals: 7 },
  lng: { min: -180, max: 180, decimals: 7 },
  water_source_lat: { min: -90, max: 90, decimals: 7 },
  water_source_lng: { min: -180, max: 180, decimals: 7 },

  // ตัวเลขทั่วไป — จำกัดสูงสุดที่ int (2.1B)
  household_count: { min: 0, max: 1000000, decimals: 0 },
  user_count: { min: 0, max: 1000000, decimals: 0 },
  metered_user_count: { min: 0, max: 1000000, decimals: 0 },
  unmetered_user_count: { min: 0, max: 1000000, decimals: 0 },
  pump_count: { min: 0, max: 1000, decimals: 0 },
  tank_count: { min: 0, max: 1000, decimals: 0 },

  // ทศนิยมทั่วไป
  water_rate: { min: 0, max: 100000, decimals: 2 },
  tank_capacity: { min: 0, max: 1000000, decimals: 2 },
  pipe_total_length: { min: 0, max: 1000000, decimals: 2 },
  water_source_distance: { min: 0, max: 100000, decimals: 2 },
  operator_years: { min: 0, max: 200, decimals: 2 },
}

function clampNumber(
  value: number,
  limits: { min?: number; max?: number; decimals?: number },
): number | null {
  if (!Number.isFinite(value)) return null
  let v = value

  if (limits.min !== undefined && v < limits.min) v = limits.min
  if (limits.max !== undefined && v > limits.max) return null // ค่าผิดปกติ → ทิ้ง
  if (limits.decimals !== undefined) {
    const factor = Math.pow(10, limits.decimals)
    v = Math.round(v * factor) / factor
  }

  return v
}

function cleanPayload(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    // ข้าม meta fields
    if (key === 'id' || key === 'created_at' || key === 'updated_at') continue

    // ค่าว่าง
    if (value === '' || value === undefined) {
      out[key] = null
      continue
    }

    // NaN
    if (typeof value === 'number' && Number.isNaN(value)) {
      out[key] = null
      continue
    }

    // ตัวเลข → clamp
    if (typeof value === 'number' && NUMERIC_LIMITS[key]) {
      out[key] = clampNumber(value, NUMERIC_LIMITS[key])
      continue
    }

    // Array → recursive
    if (Array.isArray(value)) {
      out[key] = value.map(item => {
        if (typeof item === 'object' && item !== null) return cleanPayload(item)
        if (item === '') return null
        if (typeof item === 'number' && Number.isNaN(item)) return null
        return item
      })
      continue
    }

    // Object → recursive
    if (typeof value === 'object' && value !== null) {
      out[key] = cleanPayload(value)
      continue
    }

    // ค่าปกติ
    out[key] = value
  }

  return out
}