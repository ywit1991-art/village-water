import { createClient } from '@/lib/supabase/server'
import type { Village, Survey, WaterSystem } from '@/lib/types'
import OverviewClient from '@/components/overview/overview-client'

export const revalidate = 60

export interface SystemWithContext {
  system: WaterSystem
  survey: Survey | null
  village: Village
}

export default async function OverviewPage() {
  const sb = await createClient()

  const [{ data: villages }, { data: systems }, { data: surveys }] =
    await Promise.all([
      sb.from('villages').select('*').order('village_no'),
      sb
        .from('water_systems')
        .select('*')
        .order('village_id')
        .order('system_no'),
      sb
        .from('surveys')
        .select('*')
        .in('status', ['submitted', 'approved'])
        .order('created_at', { ascending: false }),
    ])

  const vills = (villages as Village[] | null) ?? []
  const sys = (systems as WaterSystem[] | null) ?? []
  const svy = (surveys as Survey[] | null) ?? []

  const villageMap = new Map<number, Village>()
  vills.forEach(v => villageMap.set(v.id, v))

  const latestBySystem = new Map<number, Survey>()
  svy.forEach(s => {
    if (s.water_system_id && !latestBySystem.has(s.water_system_id)) {
      latestBySystem.set(s.water_system_id, s)
    }
  })

  const systemsWithContext: SystemWithContext[] = sys
    .map(s => {
      const village = villageMap.get(s.village_id)
      if (!village) return null
      return {
        system: s,
        survey: latestBySystem.get(s.id) ?? null,
        village,
      }
    })
    .filter((x): x is SystemWithContext => x !== null)

  return <OverviewClient villages={vills} systems={systemsWithContext} />
}