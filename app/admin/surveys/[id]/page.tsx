'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveSurveyAction } from '../../actions'

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
      water_rate_type: 'flat',
      water_rate_tiers: [],
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
  const [saving, setSaving] = useState(false)

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
            water_rate_type: s.water_rate_type ?? 'flat',
            water_rate_tiers: Array.isArray(s.water_rate_tiers)
              ? s.water_rate_tiers
              : [],
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
        // ===== โหมดสร้างใหม่ — pre-fill จาก water_system =====
        const { data: sys } = await sb
          .from('water_systems')
          .select('*')
          .eq('id', systemId)
          .single()

        if (sys) {
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
          } as any)
        }
      }

      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, villageId, isNew, systemId])

  // ==========================================
  // บันทึก — เรียก Server Action
  // ==========================================
  async function save(status: 'draft' | 'submitted') {
    if (saving) return
    setSaving(true)

    try {
      const values = methods.getValues()

      const formData = new FormData()
      formData.append('id', id)
      formData.append('status', status)
      formData.append('village_id', String(villageId))
      formData.append('water_system_id', String(systemId))
      formData.append('payload', JSON.stringify(values))

      const result = await saveSurveyAction(null, formData)

      if (result?.error) {
        toast.error(result.error)
        setSaving(false)
        return
      }

      toast.success(
        status === 'draft' ? 'บันทึกร่างแล้ว' : 'ส่งข้อมูลสำเร็จ',
      )
      toast.success(
        status === 'draft' ? 'บันทึกร่างแล้ว' : 'ส่งข้อมูลสำเร็จ 🎉',
      )

      // 🎉 ยิง confetti ตอนส่งสำเร็จ (ไม่ใช่ draft)
      if (status === 'submitted') {
        fireConfetti('success')
        // รอ confetti นิดนึงก่อน redirect
        await new Promise(r => setTimeout(r, 800))
      }

      router.push('/admin/dashboard')
      router.refresh()      

    } catch (err) {
      console.error('[save]', err)
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
      setSaving(false)
    }
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
              disabled={saving}
              className="btn-ghost disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกร่าง'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกและส่ง'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
              className="btn-ghost ml-auto disabled:opacity-50"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}