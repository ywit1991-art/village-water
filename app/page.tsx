import { createClient } from '@/lib/supabase/server'
import HomeContent from '@/components/home/HomeContent'

export const revalidate = 60

export default async function HomePage() {
  const sb = await createClient()

  const [{ data: surveys }] = await Promise.all([
    sb
      .from('surveys')
      .select('village_id, water_system_id, household_count')
      .in('status', ['submitted', 'approved']),
  ])

  const validSurveys = surveys ?? []

  // นับเฉพาะหมู่บ้านที่มีข้อมูลส่งเรียบร้อย
  const villagesWithData = new Set(
    validSurveys.map(s => s.village_id).filter(Boolean),
  )

  // นับเฉพาะระบบที่มีข้อมูลส่งเรียบร้อย
  const systemsWithData = new Set(
    validSurveys.map(s => s.water_system_id).filter(Boolean),
  )

  const totalHouseholds = validSurveys.reduce(
    (a, s) => a + (s.household_count ?? 0),
    0,
  )

  return (
    <HomeContent
      totalVillages={villagesWithData.size}
      totalSystems={systemsWithData.size}
      totalHouseholds={totalHouseholds}
    />
  )
}