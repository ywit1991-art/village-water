import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { canAccessSystem } from '@/lib/auth/permissions'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Survey, Village, WaterSystem } from '@/lib/types'
import ReportView from './report-view'

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect('/admin')

  const sb = createAdminClient()

  const { data: survey } = await sb
    .from('surveys')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800">ไม่พบแบบสำรวจ</h1>
          <p className="text-sm text-slate-500 mt-2">รหัส: {id}</p>
        </div>
      </div>
    )
  }

  if (
    !canAccessSystem(
      session,
      survey.water_system_id ?? 0,
      survey.village_id,
    )
  ) {
    redirect('/admin/dashboard')
  }

  const { data: village } = await sb
    .from('villages')
    .select('*')
    .eq('id', survey.village_id)
    .single()

  const { data: system } = survey.water_system_id
    ? await sb
        .from('water_systems')
        .select('*')
        .eq('id', survey.water_system_id)
        .maybeSingle()
    : { data: null }

  return (
    <ReportView
      survey={survey as Survey}
      village={village as Village}
      system={(system as WaterSystem) ?? null}
    />
  )
}