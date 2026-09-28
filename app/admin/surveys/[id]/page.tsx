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

  // ==========================================
  // โหลดข้อมูล
  // ==========================================
  useEffect(() => {
  async function load() {
    const sb = createClient()

    if (villageId) {
      const { data: v } = await sb
        .from('villages')
        .select('village_no, village_name')
        .eq('id', villageId)
        .single()
      setVillage(v)
    }

    if (!isNew && id) {
      // ===== โหมดแก้ไข =====
      const { data: s, error } = await sb
        .from('surveys')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error('[Survey] load error:', error.message)
      } else if (s) {
        const merged = {
          ...methods.getValues(),
          ...s,
          committee_members: s.committee_members ?? [],
          operator_duties: s.operator_duties ?? [],
          water_source_type: s.water_source_type ?? [],
          water_source_condition: s.water_source_condition ?? [],
          pump_types: s.pump_types ?? [],
          pumps: s.pumps ?? [],
          control_box_condition: s.control_box_condition ?? [],
          production_type: s.production_type ?? [],
          filter_condition: s.filter_condition ?? [],
          tank_types: s.tank_types ?? [],
          tank_condition: s.tank_condition ?? [],
          tank_surrounding: s.tank_surrounding ?? [],
          pipe_materials: s.pipe_materials ?? [],
          pipe_condition: s.pipe_condition ?? [],
          water_quality_appearance: s.water_quality_appearance ?? [],
          problems: s.problems ?? [],
          improvements: s.improvements ?? [],
          maintenance_items: s.maintenance_items ?? {},
          photos: s.photos ?? [],
          signatures:
            s.signatures && s.signatures.length > 0
              ? s.signatures
              : [
                  { name: '', phone: '', position: '', date: '' },
                  { name: '', phone: '', position: '', date: '' },
                  { name: '', phone: '', position: '', date: '' },
                ],
        }
        methods.reset(merged)
      }
    } else if (isNew && systemId) {
      // ===== ⭐ โหมดสร้างใหม่ — pre-fill จาก water_system =====
      const { data: sys } = await sb
        .from('water_systems')
        .select('*')
        .eq('id', systemId)
        .single()

      if (sys) {
        console.log('[Survey] pre-fill จาก water_system:', sys)
methods.reset({
  ...methods.getValues(),
  village_id: villageId,
  water_system_id: systemId,
  water_system_name: sys.system_name ?? '',
  lat: sys.lat ?? undefined,
  lng: sys.lng ?? undefined,
  location: sys.system_name ?? '',
  water_source_type: sys.water_source_type
    ? [sys.water_source_type]
    : [],
} as any)      // ← เพิ่ม as any
      }
    }

    setLoading(false)
  }
  load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id, villageId, isNew, systemId])

  // ==========================================
  // บันทึก
  // ==========================================
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
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-brand-500">กำลังโหลดข้อมูล...</p>
        </div>
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

// ==========================================
// Helper: ล้างค่า "" และ NaN ก่อนส่ง Supabase
// ==========================================
const NUMERIC_LIMITS: Record<
  string,
  { min?: number; max?: number; decimals?: number }
> = {
  lat: { min: -90, max: 90, decimals: 7 },
  lng: { min: -180, max: 180, decimals: 7 },
  water_source_lat: { min: -90, max: 90, decimals: 7 },
  water_source_lng: { min: -180, max: 180, decimals: 7 },
  household_count: { min: 0, max: 1000000, decimals: 0 },
  user_count: { min: 0, max: 1000000, decimals: 0 },
  metered_user_count: { min: 0, max: 1000000, decimals: 0 },
  unmetered_user_count: { min: 0, max: 1000000, decimals: 0 },
  pump_count: { min: 0, max: 1000, decimals: 0 },
  tank_count: { min: 0, max: 1000, decimals: 0 },
  water_rate: { min: 0, max: 100000, decimals: 2 },
  tank_capacity: { min: 0, max: 1000000, decimals: 2 },
  pipe_total_length: { min: 0, max: 1000000, decimals: 2 },
  water_source_distance: { min: 0, max: 100000, decimals: 2 },
  operator_years: { min: 0, max: 200, decimals: 2 },
}

// ฟิลด์วันที่ทั้งหมด — "" → null
const DATE_FIELDS = [
  'survey_date',
  'committee_order_date',
  'committee_start_date',
  'last_quality_test_date',
]

function clampNumber(
  value: number,
  limits: { min?: number; max?: number; decimals?: number },
): number | null {
  if (!Number.isFinite(value)) return null
  let v = value
  if (limits.min !== undefined && v < limits.min) v = limits.min
  if (limits.max !== undefined && v > limits.max) return null
  if (limits.decimals !== undefined) {
    const factor = Math.pow(10, limits.decimals)
    v = Math.round(v * factor) / factor
  }
  return v
}

function cleanPayload(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'id' || key === 'created_at' || key === 'updated_at') continue

    // วันที่ + ค่าว่าง → null
    if (DATE_FIELDS.includes(key)) {
      out[key] = value === '' || value === undefined ? null : value
      continue
    }

    if (value === '' || value === undefined) {
      out[key] = null
      continue
    }

    if (typeof value === 'number' && Number.isNaN(value)) {
      out[key] = null
      continue
    }

    if (typeof value === 'number' && NUMERIC_LIMITS[key]) {
      out[key] = clampNumber(value, NUMERIC_LIMITS[key])
      continue
    }

    if (Array.isArray(value)) {
      out[key] = value.map(item => {
        if (typeof item === 'object' && item !== null) return cleanPayload(item)
        if (item === '') return null
        if (typeof item === 'number' && Number.isNaN(item)) return null
        return item
      })
      continue
    }

    if (typeof value === 'object' && value !== null) {
      out[key] = cleanPayload(value)
      continue
    }

    out[key] = value
  }

  return out
}