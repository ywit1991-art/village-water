import { createClient } from '@/lib/supabase/server'
import HomeContent from '@/components/home/HomeContent'

export const revalidate = 60

export default async function HomePage() {
  const sb = await createClient()

  const [{ count: villageCount }, { count: systemCount }, { data: surveys }] =
    await Promise.all([
      sb.from('villages').select('*', { count: 'exact', head: true }),
      sb.from('water_systems').select('*', { count: 'exact', head: true }),
      sb
        .from('surveys')
        .select('household_count')
        .in('status', ['submitted', 'approved']),
    ])

  const totalHouseholds = (surveys ?? []).reduce(
    (a, s) => a + (s.household_count ?? 0),
    0,
  )

  return (
    <HomeContent
      totalVillages={villageCount ?? 0}
      totalSystems={systemCount ?? 0}
      totalHouseholds={totalHouseholds}
      totalSurveys={surveys?.length ?? 0}
    />
  )
}